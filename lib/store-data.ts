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

// Los dos números que reciben pedidos, uno por país.
export const WHATSAPP_DESTINATIONS: WhatsAppDestination[] = [
  {
    id: "co",
    label: "Colombia",
    number: "573112020366",
    displayNumber: "+57 311 2020366",
    flag: "🇨🇴",
  },
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
 * "2 cajas y media". Devuelve null cuando la cantidad es un número entero.
 */
export function qtyHint(qty: number): string | null {
  if (Number.isInteger(qty)) return null;
  const whole = Math.floor(qty);
  return whole === 0
    ? "media caja"
    : `${whole} caja${whole === 1 ? "" : "s"} y media`;
}

// --- Políticas de venta ---
/**
 * ¿Este producto se puede pedir por media caja?
 * Regla dura: confitería NO, cantidades por caja impares NO. Además el admin
 * puede desactivarlo con `allowHalfBox` para cualquier producto.
 */
export function canBuyHalfBox(p: Product): boolean {
  if (p.category === "confiteria") return false;
  if (p.unitsPerBox != null && p.unitsPerBox % 2 !== 0) return false;
  return p.allowHalfBox;
}

/** Paso del contador de cantidad: 0.5 si permite media caja, 1 si no. */
export function qtyStep(p: Product): number {
  return canBuyHalfBox(p) ? 0.5 : 1;
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
export function productSearchText(p: Product, categoryLabel: string): string {
  return [
    p.name,
    p.brand,
    p.flavor,
    p.presentation,
    categoryLabel,
    p.grams != null ? `${p.grams}g ${p.grams} gramos` : "",
    p.milliliters != null ? `${p.milliliters}ml ${p.milliliters} mililitros` : "",
  ]
    .join(" ")
    .toLowerCase();
}

export function matchesQuery(text: string, query: string): boolean {
  const q = query.trim().toLowerCase();
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
        unit: p.unit,
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

export function buildOrderMessage(
  cart: Cart,
  products: Product[],
  businessName: string,
): string {
  const lines = cartLines(cart, products);
  const total = lines.reduce((sum, l) => sum + l.total, 0);
  const totalDiscount = lines.reduce((sum, l) => sum + l.discount, 0);

  const body = [
    `Hola ${businessName || "Surtifronteras"}, quiero hacer este pedido (venta al mayor) desde la página web:`,
    "",
    ...lines.map((l) => {
      const label = l.brand ? `${l.brand} ${l.name}` : l.name;
      const pres = l.presentationLabel ? ` ${l.presentationLabel}` : "";
      const disc = l.discount > 0 ? ` (promo -${formatPrice(l.discount)})` : "";
      return `• ${label}${pres} x${formatQty(l.qty)} — ${formatPrice(l.total)}${disc}`;
    }),
    "",
    ...(totalDiscount > 0
      ? [`Descuento por promociones: -${formatPrice(totalDiscount)}`]
      : []),
    `Total: ${formatPrice(total)}`,
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
