import type { Product } from "./store-data";

// Catálogo inicial de Surtifronteras.
// Se usa para (1) sembrar la base la primera vez que arranca, y
// (2) como fallback de solo lectura cuando la base todavía no está conectada.
// Vacío a propósito: cargá el catálogo real desde /admin.
export const SEED_PRODUCTS: Product[] = [];
