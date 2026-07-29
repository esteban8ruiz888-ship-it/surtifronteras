// Datos de productos + helpers de catálogo/carrito/WhatsApp para Surtifronteras.

export const BUSINESS_NAME = "Surtifronteras";

export type WhatsAppDestinationId = "co" | "ve";

export interface WhatsAppDestination {
  id: WhatsAppDestinationId;
  label: string;
  /** Código de país + número, solo dígitos, sin "+" ni espacios. */
  number: string;
  /** Como se muestra al público (footer, etc). */
  displayNumber: string;
  flag: string;
}

// Número que recibe los pedidos.
export const WHATSAPP_DESTINATIONS: WhatsAppDestination[] = [
  {
    id: "ve",
    label: "Venezuela",
    number: "584247133168",
    displayNumber: "+58 424-7133168",
    flag: "🇻🇪",
  },
];

export type CategoryId =
  | "viveres"
  | "confiteria"
  | "licores"
  | "bebidas"
  | "charcuteria"
  | "varios";

export interface Category {
  id: CategoryId;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: "viveres", label: "Víveres" },
  { id: "confiteria", label: "Confitería" },
  { id: "licores", label: "Licores" },
  { id: "bebidas", label: "Bebidas" },
  { id: "charcuteria", label: "Charcutería" },
  { id: "varios", label: "Varios" },
];

// Tonos de la marca (tomados del logo), rotados por categoría para el color del tag.
export const CATEGORY_COLOR: Record<CategoryId, string> = {
  viveres: "#0A2A78",
  confiteria: "#CC1830",
  licores: "#B8901A",
  bebidas: "#0A2A78",
  charcuteria: "#CC1830",
  varios: "#B8901A",
};

// --- Disponibilidad (3 estados) ---
export type Availability = "available" | "coming_soon" | "out_of_stock";

export const AVAILABILITY_META: Record<
  Availability,
  { label: string; emoji: string; color: string }
> = {
  available: { label: "Disponible", emoji: "🟢", color: "#2FA84F" },
  coming_soon: { label: "Próximamente", emoji: "🟡", color: "#B8901A" },
  out_of_stock: { label: "Agotado temporalmente", emoji: "🔴", color: "#CC1830" },
};

export interface Product {
  id: number;
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
  unitsPerBox: number | null;
  /** Flag del admin: ¿se puede vender media caja? (además la política lo fuerza). */
  allowHalfBox: boolean;
  /** Se vende por kilo (a granel) en vez de por caja/bulto/unidad. */
  soldByWeight: boolean;
  availability: Availability;
  featured: boolean;
  isNew: boolean;
  /** Promo por volumen: si la cantidad supera este umbral, se aplica el descuento. */
  promoThreshold: number | null;
  promoDiscount: number | null;
}

export interface CartLine {
  id: number;
  name: string;
  brand: string;
  flavor: string;
  unit: string;
  presentationLabel: string;
  price: number;
  qty: number;
  subtotal: number;
  discount: number;
  total: number;
}

/** Carrito: id de producto -> cantidad (puede ser 0.5, 1, 1.5…). */
export type Cart = Record<number, number>;

// --- Formateo ---
const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatPrice(n: number): string {
  return copFormatter.format(n);
}

/** Formatea cantidades que pueden ser medias unidades (0.5, 1, 1.5, 2…). */
export function formatQty(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/**
 * Pista legible para cantidades fraccionarias, ej. "media caja" o
 * "2 bultos y media". Devuelve null cuando la cantidad es entera, o cuando
 * la unidad es "kg" (ahí el número solo, ej. "1.5", ya se entiende).
 */
export function qtyHint(qty: number, unit: string): string | null {
  if (Number.isInteger(qty)) return null;
  if (unit === "kg") return null;
  const whole = Math.floor(qty);
  return whole === 0
    ? `media ${unit}`
    : `${whole} ${unit}${whole === 1 ? "" : "s"} y media`;
}

// --- Políticas de venta ---
/**
 * ¿Este producto se puede pedir por media caja/bulto?
 * Si se vende por kilo, siempre sí (peso continuo). Si las unidades por caja
 * son impares, nunca (no hay una mitad exacta). Para el resto —incluida
 * confitería— manda el flag `allowHalfBox` que pone el admin por producto.
 */
export function canBuyHalfBox(p: Product): boolean {
  if (p.soldByWeight) return true;
  if (p.unitsPerBox != null && p.unitsPerBox % 2 !== 0) return false;
  return p.allowHalfBox;
}

/** Paso del contador de cantidad: 0.5 si permite media caja, 1 si no. */
export function qtyStep(p: Product): number {
  return canBuyHalfBox(p) ? 0.5 : 1;
}

/**
 * Unidad de venta que se le muestra al cliente: "kg" si se vende por peso,
 * "bulto" para confitería (no se vende en cajas de cartón), o la unidad
 * guardada (por defecto "caja").
 */
export function effectiveUnit(p: Product): string {
  if (p.soldByWeight) return "kg";
  // El campo `unit` es la fuente de verdad explícita (caja/bulto/unidad),
  // elegido por el admin al crear/editar el producto.
  return p.unit || "caja";
}

/**
 * Unidad con la cantidad por caja: "caja de 12", "bulto de 12". Para kg o
 * unidad devuelve solo la etiqueta (no tiene sentido "de N"). Tampoco "de 0".
 */
// Unidades que contienen varias piezas adentro → muestran "de N".
// "pieza"/"unidad"/"kg" son una sola cosa, no llevan conteo.
const UNITS_WITH_COUNT = new Set(["caja", "bulto", "bandeja", "tira"]);

export function unitWithCount(p: Product): string {
  const unit = effectiveUnit(p);
  const showCount =
    UNITS_WITH_COUNT.has(unit) && p.unitsPerBox != null && p.unitsPerBox > 0;
  return showCount ? `${unit} de ${p.unitsPerBox}` : unit;
}

/** Etiqueta corta de presentación: "Lata · 350 ml", "Bolsa · 500 g", etc. */
export function presentationLabel(p: Product): string {
  const parts: string[] = [];
  if (p.presentation) parts.push(p.presentation);
  if (p.milliliters != null) parts.push(`${p.milliliters} ml`);
  else if (p.grams != null) parts.push(`${p.grams} g`);
  return parts.join(" · ");
}

// --- Búsqueda ---
/** Pasa a minúsculas y saca las tildes, para que la búsqueda las ignore. */
function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function productSearchText(p: Product, categoryLabel: string): string {
  return normalizeForSearch(
    [
      p.name,
      p.brand,
      p.flavor,
      p.presentation,
      categoryLabel,
      p.grams != null ? `${p.grams}g ${p.grams} gramos` : "",
      p.milliliters != null ? `${p.milliliters}ml ${p.milliliters} mililitros` : "",
    ].join(" "),
  );
}

export function matchesQuery(text: string, query: string): boolean {
  const q = normalizeForSearch(query.trim());
  if (!q) return true;
  return q.split(/\s+/).every((term) => text.includes(term));
}

// --- Promociones ---
export function computeLineDiscount(p: Product, qty: number): number {
  if (
    p.promoThreshold != null &&
    p.promoDiscount != null &&
    p.promoDiscount > 0 &&
    qty > p.promoThreshold
  ) {
    return p.promoDiscount;
  }
  return 0;
}

export function hasPromo(p: Product): boolean {
  return (
    p.promoThreshold != null && p.promoDiscount != null && p.promoDiscount > 0
  );
}

// --- Carrito ---
export function cartCount(cart: Cart): number {
  return Object.values(cart || {}).reduce(
    (sum, qty) => sum + (qty > 0 ? qty : 0),
    0,
  );
}

export function cartLines(cart: Cart, products: Product[]): CartLine[] {
  return Object.entries(cart || {})
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const p = products.find((pr) => String(pr.id) === String(id));
      if (!p) return null;
      const subtotal = p.price * qty;
      const discount = computeLineDiscount(p, qty);
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        flavor: p.flavor,
        unit: effectiveUnit(p),
        presentationLabel: presentationLabel(p),
        price: p.price,
        qty,
        subtotal,
        discount,
        total: subtotal - discount,
      };
    })
    .filter((line): line is CartLine => line !== null);
}

export function cartTotal(cart: Cart, products: Product[]): number {
  return cartLines(cart, products).reduce((sum, l) => sum + l.total, 0);
}

export function cartDiscountTotal(cart: Cart, products: Product[]): number {
  return cartLines(cart, products).reduce((sum, l) => sum + l.discount, 0);
}

/** Pluraliza la unidad para el mensaje de pedido ("caja"→"cajas", "kg" no cambia). */
function pluralUnit(qty: number, unit: string): string {
  if (unit === "kg" || qty === 1) return unit;
  return /[aeiouáéíóú]$/i.test(unit) ? `${unit}s` : `${unit}es`;
}

export function buildOrderMessage(
  cart: Cart,
  products: Product[],
  businessName: string,
): string {
  const lines = cartLines(cart, products);
  const total = lines.reduce((sum, l) => sum + l.total, 0);
  const totalDiscount = lines.reduce((sum, l) => sum + l.discount, 0);

  const body = [
    `Hola, ${businessName || "Surtifronteras"}. Quiero realizar el siguiente pedido al por mayor desde la página web:`,
    "",
    ...lines.map((l) => {
      const label = l.brand ? `${l.brand} ${l.name}` : l.name;
      const pres = l.presentationLabel ? ` (${l.presentationLabel})` : "";
      // No repetir el sabor si es igual a la marca (dato duplicado en algunos productos).
      const flavorPart =
        l.flavor && l.flavor.toLowerCase() !== l.brand.toLowerCase()
          ? ` – ${l.flavor}`
          : "";
      const unit = pluralUnit(l.qty, l.unit);
      const disc = l.discount > 0 ? ` (promo -${formatPrice(l.discount)})` : "";
      return `• ${label}${pres}${flavorPart}: ${formatQty(l.qty)} ${unit} — ${formatPrice(l.total)}${disc}`;
    }),
    "",
    ...(totalDiscount > 0
      ? [`Descuento por promociones: -${formatPrice(totalDiscount)}`]
      : []),
    `Total del pedido: ${formatPrice(total)}`,
  ];
  return body.join("\n");
}

export function buildWhatsAppUrl(
  cart: Cart,
  products: Product[],
  businessName: string,
  destinationNumber: string,
): string {
  const msg = buildOrderMessage(cart, products, businessName);
  return `https://wa.me/${destinationNumber}?text=${encodeURIComponent(msg)}`;
}
