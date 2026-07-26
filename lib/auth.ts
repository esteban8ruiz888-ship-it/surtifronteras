import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { getAdminPasswordHash } from "./db";

const COOKIE_NAME = "sf_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Falta la variable de entorno SESSION_SECRET.");
  return new TextEncoder().encode(secret);
}

/** ¿Están configuradas las variables mínimas para que el login funcione? */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET);
}

const SCRYPT_KEYLEN = 64;

/** Genera un hash con sal para guardar la contraseña. Formato: scrypt$<sal>$<hash>. */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/** Compara la contraseña contra un hash scrypt guardado, en tiempo constante. */
function matchesHash(input: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[1], "hex");
    expected = Buffer.from(parts[2], "hex");
  } catch {
    return false;
  }
  const actual = scryptSync(input, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Compara contra ADMIN_PASSWORD (respaldo) en tiempo (casi) constante. */
function matchesEnvPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < input.length; i++) {
    mismatch |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Verifica la contraseña: primero contra el hash guardado en la base (si el
 * admin ya la cambió desde el panel); si todavía no hay hash, contra la
 * variable de entorno ADMIN_PASSWORD (respaldo / primer arranque).
 */
export async function verifyPassword(input: string): Promise<boolean> {
  const stored = await getAdminPasswordHash();
  if (stored) return matchesHash(input, stored);
  return matchesEnvPassword(input);
}

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return false;
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

/** Para páginas del admin: si no hay sesión válida, manda al login. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin");
}
