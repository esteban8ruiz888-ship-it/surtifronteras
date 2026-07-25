"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BUSINESS_NAME,
  CATEGORIES,
  CATEGORY_COLOR,
  buildWhatsAppUrl,
  cartCount,
  cartDiscountTotal,
  cartLines,
  cartTotal,
  formatPrice,
  matchesQuery,
  productSearchText,
  qtyStep,
  WHATSAPP_DESTINATIONS,
  type CategoryId,
  type Product,
} from "@/lib/store-data";
import { SiteHeader } from "./site-header";
import { Hero } from "./hero";
import { CategoryTabs, type TabId } from "./category-tabs";
import { ProductCard } from "./product-card";
import { AboutSection } from "./about-section";
import { SiteFooter } from "./site-footer";
import { CartDrawer } from "./cart-drawer";
import { CartIcon } from "./icons";

export function Storefront({
  products,
  aboutImageUrl,
}: {
  products: Product[];
  aboutImageUrl: string | null;
}) {
  const [activeCategory, setActiveCategory] = useState<TabId>("todos");
  const [query, setQuery] = useState("");
  const [qtyDraft, setQtyDraft] = useState<Record<number, number>>({});
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  const catalogRef = useRef<HTMLElement | null>(null);
  const addTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addTimer.current) clearTimeout(addTimer.current);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const roundToStep = (p: Product, n: number) => {
    const s = qtyStep(p);
    return Math.round(n / s) * s;
  };

  const setQty = useCallback(
    (id: number, val: number) => {
      const p = productMap.get(id);
      if (!p) return;
      const s = qtyStep(p);
      const v = Math.max(s, Math.min(60, Math.round(val / s) * s));
      setQtyDraft((st) => ({ ...st, [id]: v }));
    },
    [productMap],
  );

  const addToCart = useCallback(
    (id: number) => {
      const p = productMap.get(id);
      if (!p) return;
      const qty = qtyDraft[id] || 1;
      setCart((c) => ({ ...c, [id]: roundToStep(p, (c[id] || 0) + qty) }));
      setQtyDraft((s) => ({ ...s, [id]: 1 }));
      setJustAddedId(id);
      if (addTimer.current) clearTimeout(addTimer.current);
      addTimer.current = setTimeout(() => setJustAddedId(null), 1100);
    },
    [productMap, qtyDraft],
  );

  const incCartQty = useCallback(
    (id: number) => {
      const p = productMap.get(id);
      if (!p) return;
      setCart((c) => ({ ...c, [id]: roundToStep(p, (c[id] || 0) + qtyStep(p)) }));
    },
    [productMap],
  );

  const decCartQty = useCallback(
    (id: number) => {
      const p = productMap.get(id);
      if (!p) return;
      setCart((c) => {
        const q = roundToStep(p, (c[id] || 0) - qtyStep(p));
        const next = { ...c };
        if (q <= 0) delete next[id];
        else next[id] = q;
        return next;
      });
    },
    [productMap],
  );

  const removeCartLine = useCallback(
    (id: number) =>
      setCart((c) => {
        const next = { ...c };
        delete next[id];
        return next;
      }),
    [],
  );

  const toggleCart = useCallback(() => setCartOpen((o) => !o), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const scrollToCatalog = useCallback(() => {
    const el = catalogRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 84;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const tabs = useMemo<{ id: TabId; label: string }[]>(
    () => [{ id: "todos", label: "Todos" }, ...CATEGORIES],
    [],
  );

  const categoryLabel = useCallback(
    (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? "",
    [],
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== "todos" && p.category !== activeCategory) return false;
      return matchesQuery(productSearchText(p, categoryLabel(p.category)), query);
    });
  }, [products, activeCategory, query, categoryLabel]);

  const browsing = query.trim() === "" && activeCategory === "todos";
  const featured = useMemo(
    () => products.filter((p) => p.featured && p.availability !== "out_of_stock"),
    [products],
  );
  const novelties = useMemo(() => products.filter((p) => p.isNew), [products]);

  const lines = useMemo(() => cartLines(cart, products), [cart, products]);
  const count = useMemo(() => cartCount(cart), [cart]);
  const total = useMemo(() => cartTotal(cart, products), [cart, products]);
  const discountTotal = useMemo(
    () => cartDiscountTotal(cart, products),
    [cart, products],
  );

  const onWhatsApp = useCallback(
    (destinationNumber: string) => {
      const url = buildWhatsAppUrl(cart, products, BUSINESS_NAME, destinationNumber);
      window.open(url, "_blank");
    },
    [cart, products],
  );

  const renderCard = (p: Product) => {
    const draft = qtyDraft[p.id] || 1;
    return (
      <ProductCard
        key={p.id}
        product={p}
        categoryLabel={categoryLabel(p.category)}
        categoryColor={CATEGORY_COLOR[p.category]}
        qty={draft}
        justAdded={justAddedId === p.id}
        onDec={() => setQty(p.id, draft - qtyStep(p))}
        onInc={() => setQty(p.id, draft + qtyStep(p))}
        onAdd={() => addToCart(p.id)}
      />
    );
  };

  const gridCls =
    "grid grid-cols-[repeat(auto-fill,minmax(215px,1fr))] gap-4 sm:gap-[22px]";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-cream font-body text-ink">
      <SiteHeader cartCount={count} onToggleCart={toggleCart} />
      <Hero onScrollToCatalog={scrollToCatalog} />

      {/* Buscador protagonista */}
      <div className="bg-white px-5 py-5 shadow-[0_2px_10px_rgba(10,42,120,0.05)] sm:px-6">
        <div className="relative mx-auto max-w-[720px]">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, marca, sabor, gramos, ml…"
            aria-label="Buscar productos"
            className="w-full rounded-full border border-warm-border bg-cream py-3.5 pl-12 pr-4 text-[15px] text-ink outline-none focus:border-navy"
          />
        </div>
      </div>

      <CategoryTabs
        categories={tabs}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="mx-auto max-w-[1180px] px-5 sm:px-6">
        {browsing && featured.length > 0 && (
          <section className="pb-2 pt-2">
            <h2 className="font-heading mb-4 text-[22px] text-navy sm:text-[24px]">
              Productos destacados
            </h2>
            <div className={gridCls}>{featured.map(renderCard)}</div>
          </section>
        )}

        {browsing && novelties.length > 0 && (
          <section className="pb-2 pt-6">
            <h2 className="font-heading mb-4 text-[22px] text-navy sm:text-[24px]">
              Novedades <span className="text-brand-red">✦</span>
            </h2>
            <div className={gridCls}>{novelties.map(renderCard)}</div>
          </section>
        )}
      </div>

      <section
        ref={catalogRef}
        className="mx-auto max-w-[1180px] px-5 pb-[60px] pt-6 sm:px-6"
      >
        <h2 className="font-heading mb-5 text-[24px] text-navy sm:text-[26px]">
          {query.trim() ? "Resultados" : "Catálogo"}
        </h2>
        {filtered.length === 0 ? (
          <p className="text-[14px] text-muted">
            {query.trim()
              ? `No encontramos productos para “${query.trim()}”.`
              : "No hay productos en esta categoría todavía."}
          </p>
        ) : (
          <div className={gridCls}>{filtered.map(renderCard)}</div>
        )}
      </section>

      <AboutSection imageUrl={aboutImageUrl} />
      <SiteFooter />

      {/* Botón flotante de carrito: se ve cuánto y qué llevás sin subir arriba */}
      {count > 0 && (
        <button
          onClick={toggleCart}
          aria-label={`Ver carrito · ${count} productos · ${formatPrice(total)}`}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-navy py-3 pl-4 pr-5 text-white shadow-[0_8px_24px_rgba(10,42,120,0.35)] transition-transform hover:scale-105"
        >
          <span className="relative flex items-center">
            <CartIcon className="h-6 w-6" />
            <span className="absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-yellow px-1 text-[11px] font-extrabold text-navy">
              {count}
            </span>
          </span>
          <span className="text-[14.5px] font-extrabold">{formatPrice(total)}</span>
        </button>
      )}

      <CartDrawer
        open={cartOpen}
        lines={lines}
        total={total}
        discountTotal={discountTotal}
        onClose={closeCart}
        onIncLine={incCartQty}
        onDecLine={decCartQty}
        onRemoveLine={removeCartLine}
        onWhatsAppSelect={onWhatsApp}
      />
    </div>
  );
}
