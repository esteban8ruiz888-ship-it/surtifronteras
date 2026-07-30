"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSession,
  destroySession,
  hashPassword,
  isAuthConfigured,
  requireAuth,
  verifyPassword,
} from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  isDbConfigured,
  setAboutImageUrl,
  setAdminPasswordHash,
  setPresentations,
  updateProduct,
  type ProductInput,
} from "@/lib/db";
import type { Availability, CategoryId } from "@/lib/store-data";
import { AVAILABILITY_META, CATEGORIES } from "@/lib/store-data";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isAuthConfigured()) {
    return {
      error:
        "El servidor no tiene configuradas ADMIN_PASSWORD y SESSION_SECRET.",
    };
  }
  const password = String(formData.get("password") ?? "");
  if (!(await verifyPassword(password))) {
    return { error: "Contraseña incorrecta." };
  }
  await createSession();
  redirect("/admin");
}

export type ChangePasswordState = { ok?: boolean; error?: string };

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  // No exige sesión: el candado es la contraseña actual (se verifica abajo),
  // así también se puede cambiar desde la pantalla de login.
  if (!isDbConfigured()) {
    return {
      error:
        "La base de datos no está conectada, no se puede guardar la contraseña.",
    };
  }
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!(await verifyPassword(current))) {
    return { error: "La contraseña actual no es correcta." };
  }
  if (next.length < 6) {
    return { error: "La nueva contraseña debe tener al menos 6 caracteres." };
  }
  if (next !== confirm) {
    return { error: "La nueva contraseña y su confirmación no coinciden." };
  }
  if (next === current) {
    return { error: "La nueva contraseña debe ser distinta de la actual." };
  }
  try {
    await setAdminPasswordHash(hashPassword(next));
  } catch (e) {
    return {
      error: "No se pudo cambiar la contraseña: " + (e as Error).message,
    };
  }
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin");
}

export type SaveResult = { ok: boolean; error?: string };

const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.id));
const VALID_AVAILABILITY = new Set<string>(Object.keys(AVAILABILITY_META));

export type ProductFormInput = {
  id?: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  imageUrl: string | null;
  brand: string;
  flavor: string;
  presentation: string;
  grams: number | null;
  milliliters: number | null;
  weightUnit: string;
  volumeUnit: string;
  unitsPerBox: number | null;
  allowHalfBox: boolean;
  soldByWeight: boolean;
  availability: string;
  featured: boolean;
  isNew: boolean;
  promoThreshold: number | null;
  promoDiscount: number | null;
};

export async function saveProduct(input: ProductFormInput): Promise<SaveResult> {
  await requireAuth();

  if (!isDbConfigured()) {
    return {
      ok: false,
      error:
        "La base de datos no está conectada. Conectá Vercel Postgres para guardar cambios.",
    };
  }

  const name = input.name.trim();
  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  if (!VALID_CATEGORIES.has(input.category)) {
    return { ok: false, error: "Categoría inválida." };
  }
  if (!Number.isFinite(input.price) || input.price < 0) {
    return { ok: false, error: "El precio no es válido." };
  }
  const availability = VALID_AVAILABILITY.has(input.availability)
    ? (input.availability as Availability)
    : "available";

  const posIntOrNull = (n: number | null): number | null =>
    n != null && Number.isFinite(n) && n >= 0 ? n : null;

  const data: ProductInput = {
    name,
    category: input.category as CategoryId,
    price: Math.round(input.price),
    unit: input.unit.trim(),
    imageUrl: input.imageUrl,
    brand: input.brand.trim(),
    flavor: input.flavor.trim(),
    presentation: input.presentation.trim(),
    grams: posIntOrNull(input.grams),
    milliliters: posIntOrNull(input.milliliters),
    weightUnit: input.weightUnit === "kg" ? "kg" : "g",
    volumeUnit: input.volumeUnit === "l" ? "l" : "ml",
    unitsPerBox: posIntOrNull(input.unitsPerBox),
    allowHalfBox: Boolean(input.allowHalfBox),
    soldByWeight: Boolean(input.soldByWeight),
    availability,
    featured: Boolean(input.featured),
    isNew: Boolean(input.isNew),
    promoThreshold: posIntOrNull(input.promoThreshold),
    promoDiscount: posIntOrNull(input.promoDiscount),
  };

  try {
    if (input.id) await updateProduct(input.id, data);
    else await createProduct(data);
  } catch (e) {
    return { ok: false, error: "No se pudo guardar: " + (e as Error).message };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  // "/admin" solo invalida esa página exacta, no cada /admin/[id]. Sin esto,
  // volver a entrar a editar el mismo producto puede mostrar datos viejos.
  revalidatePath("/admin/[id]", "page");
  return { ok: true };
}

export async function savePresentationsAction(
  list: string[],
): Promise<SaveResult> {
  await requireAuth();
  if (!isDbConfigured()) {
    return { ok: false, error: "La base de datos no está conectada." };
  }
  try {
    await setPresentations(list);
  } catch (e) {
    return { ok: false, error: "No se pudo guardar: " + (e as Error).message };
  }
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveAboutImage(imageUrl: string | null): Promise<SaveResult> {
  await requireAuth();
  if (!isDbConfigured()) {
    return {
      ok: false,
      error: "La base de datos no está conectada. Conectá Vercel Postgres para guardar cambios.",
    };
  }
  try {
    await setAboutImageUrl(imageUrl);
  } catch (e) {
    return { ok: false, error: "No se pudo guardar: " + (e as Error).message };
  }
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteProductAction(id: number): Promise<SaveResult> {
  await requireAuth();
  if (!isDbConfigured()) {
    return { ok: false, error: "La base de datos no está conectada." };
  }
  try {
    await deleteProduct(id);
  } catch (e) {
    return { ok: false, error: "No se pudo borrar: " + (e as Error).message };
  }
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}
