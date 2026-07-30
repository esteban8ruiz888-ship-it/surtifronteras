import { neon } from "@neondatabase/serverless";
import type { Availability, CategoryId, Product } from "./store-data";
import { SEED_PRODUCTS } from "./seed-data";

type Sql = ReturnType<typeof neon>;

// La integración de Postgres (Neon) en Vercel normalmente inyecta DATABASE_URL /
// POSTGRES_URL. Pero si al conectar la integración se le puso un prefijo de grupo
// (p. ej. "DATABASE_URL"), las variables quedan como DATABASE_URL_DATABASE_URL, etc.
function getConnectionString(): string | null {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_DATABASE_URL ||
    process.env.DATABASE_URL_POSTGRES_URL ||
    process.env.DATABASE_URL_POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED ||
    null
  );
}

export function isDbConfigured(): boolean {
  return Boolean(getConnectionString());
}

let client: Sql | null = null;
function getSql(): Sql {
  const cs = getConnectionString();
  if (!cs) throw new Error("No hay base de datos configurada (falta DATABASE_URL).");
  if (!client) client = neon(cs);
  return client;
}

type ProductRow = {
  id: number;
  name: string;
  category: string;
  price: string | number;
  unit: string;
  image_url: string | null;
  brand: string | null;
  flavor: string | null;
  presentation: string | null;
  grams: string | number | null;
  milliliters: string | number | null;
  weight_unit: string | null;
  volume_unit: string | null;
  units_per_box: number | null;
  allow_half_box: boolean | null;
  sold_by_weight: boolean | null;
  availability: string | null;
  featured: boolean | null;
  is_new: boolean | null;
  promo_threshold: string | number | null;
  promo_discount: string | number | null;
};

function numOrNull(v: string | number | null): number | null {
  return v == null ? null : Number(v);
}

function toProduct(r: ProductRow): Product {
  return {
    id: Number(r.id),
    name: r.name,
    category: r.category as CategoryId,
    price: Number(r.price),
    unit: r.unit ?? "",
    imageUrl: r.image_url ?? null,
    brand: r.brand ?? "",
    flavor: r.flavor ?? "",
    presentation: r.presentation ?? "",
    grams: numOrNull(r.grams),
    milliliters: numOrNull(r.milliliters),
    weightUnit: r.weight_unit ?? "g",
    volumeUnit: r.volume_unit ?? "ml",
    unitsPerBox: r.units_per_box == null ? null : Number(r.units_per_box),
    allowHalfBox: r.allow_half_box ?? true,
    soldByWeight: r.sold_by_weight ?? false,
    availability: (r.availability as Availability) ?? "available",
    featured: r.featured ?? false,
    isNew: r.is_new ?? false,
    promoThreshold: numOrNull(r.promo_threshold),
    promoDiscount: numOrNull(r.promo_discount),
  };
}

let schemaReady = false;
async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Columnas nuevas — se agregan sin perder datos existentes.
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT ''`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS flavor TEXT DEFAULT ''`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS presentation TEXT DEFAULT ''`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS grams NUMERIC`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS milliliters NUMERIC`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'g'`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS volume_unit TEXT DEFAULT 'ml'`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS units_per_box INTEGER`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS allow_half_box BOOLEAN DEFAULT true`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_by_weight BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available'`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS promo_threshold NUMERIC`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS promo_discount NUMERIC`;
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `;
  const countRows = (await sql`SELECT COUNT(*)::int AS count FROM products`) as {
    count: number;
  }[];
  if (Number(countRows[0]?.count ?? 0) === 0) {
    for (const p of SEED_PRODUCTS) {
      await sql`
        INSERT INTO products (name, category, price, unit, image_url)
        VALUES (${p.name}, ${p.category}, ${p.price}, ${p.unit}, ${p.imageUrl})
      `;
    }
  }
  schemaReady = true;
}

export type ProductInput = {
  name: string;
  category: CategoryId;
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
  availability: Availability;
  featured: boolean;
  isNew: boolean;
  promoThreshold: number | null;
  promoDiscount: number | null;
};

export async function getProducts(): Promise<Product[]> {
  // Fallback: sin base conectada, el storefront sigue andando con el catálogo semilla.
  if (!isDbConfigured()) return SEED_PRODUCTS;
  await ensureSchema();
  const sql = getSql();
  // Agrupa productos iguales/parecidos: por categoría, luego nombre y marca.
  // Así un producto nuevo aparece junto a sus pares y no al final de todo.
  const rows =
    (await sql`SELECT * FROM products ORDER BY category ASC, name ASC, brand ASC, id ASC`) as ProductRow[];
  return rows.map(toProduct);
}

export async function getProduct(id: number): Promise<Product | null> {
  if (!isDbConfigured()) return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM products WHERE id = ${id}`) as ProductRow[];
  return rows[0] ? toProduct(rows[0]) : null;
}

export async function createProduct(input: ProductInput): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO products
      (name, category, price, unit, image_url, brand, flavor, presentation,
       grams, milliliters, weight_unit, volume_unit, units_per_box, allow_half_box,
       sold_by_weight, availability,
       featured, is_new, promo_threshold, promo_discount)
    VALUES
      (${input.name}, ${input.category}, ${input.price}, ${input.unit}, ${input.imageUrl},
       ${input.brand}, ${input.flavor}, ${input.presentation},
       ${input.grams}, ${input.milliliters}, ${input.weightUnit}, ${input.volumeUnit},
       ${input.unitsPerBox}, ${input.allowHalfBox},
       ${input.soldByWeight}, ${input.availability}, ${input.featured}, ${input.isNew},
       ${input.promoThreshold}, ${input.promoDiscount})
  `;
}

export async function updateProduct(id: number, input: ProductInput): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    UPDATE products SET
      name = ${input.name},
      category = ${input.category},
      price = ${input.price},
      unit = ${input.unit},
      image_url = ${input.imageUrl},
      brand = ${input.brand},
      flavor = ${input.flavor},
      presentation = ${input.presentation},
      grams = ${input.grams},
      milliliters = ${input.milliliters},
      weight_unit = ${input.weightUnit},
      volume_unit = ${input.volumeUnit},
      units_per_box = ${input.unitsPerBox},
      allow_half_box = ${input.allowHalfBox},
      sold_by_weight = ${input.soldByWeight},
      availability = ${input.availability},
      featured = ${input.featured},
      is_new = ${input.isNew},
      promo_threshold = ${input.promoThreshold},
      promo_discount = ${input.promoDiscount}
    WHERE id = ${id}
  `;
}

export async function deleteProduct(id: number): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`DELETE FROM products WHERE id = ${id}`;
}

// --- Settings (clave/valor) ---
async function getSetting(key: string): Promise<string | null> {
  if (!isDbConfigured()) return null;
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`SELECT value FROM settings WHERE key = ${key}`) as {
    value: string | null;
  }[];
  return rows[0]?.value ?? null;
}

async function setSetting(key: string, value: string | null): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value}
  `;
}

const ABOUT_IMAGE_KEY = "about_image_url";

export async function getAboutImageUrl(): Promise<string | null> {
  return getSetting(ABOUT_IMAGE_KEY);
}

export async function setAboutImageUrl(url: string | null): Promise<void> {
  await setSetting(ABOUT_IMAGE_KEY, url);
}

// --- Presentaciones (lista administrable) ---
const PRESENTATIONS_KEY = "presentations";
export const DEFAULT_PRESENTATIONS = [
  "Lata",
  "Botella",
  "Bolsa",
  "Sachet",
  "Caja",
  "Frasco",
  "Paquete",
  "Display",
  "Six-pack",
  "Unidad",
];

export async function getPresentations(): Promise<string[]> {
  const raw = await getSetting(PRESENTATIONS_KEY);
  if (!raw) return DEFAULT_PRESENTATIONS;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed;
    }
  } catch {
    // valor corrupto — caemos a los defaults
  }
  return DEFAULT_PRESENTATIONS;
}

export async function setPresentations(list: string[]): Promise<void> {
  const clean = Array.from(
    new Set(list.map((s) => s.trim()).filter(Boolean)),
  );
  await setSetting(PRESENTATIONS_KEY, JSON.stringify(clean));
}

// --- Contraseña del admin (hash guardado en settings) ---
const ADMIN_PASSWORD_HASH_KEY = "admin_password_hash";

/** Hash de la contraseña del admin, o null si nunca se cambió desde el panel. */
export async function getAdminPasswordHash(): Promise<string | null> {
  return getSetting(ADMIN_PASSWORD_HASH_KEY);
}

export async function setAdminPasswordHash(hash: string): Promise<void> {
  await setSetting(ADMIN_PASSWORD_HASH_KEY, hash);
}
