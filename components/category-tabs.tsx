import type { CategoryId } from "@/lib/store-data";

export type TabId = "todos" | CategoryId;

export function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: { id: TabId; label: string }[];
  activeCategory: TabId;
  onSelect: (id: TabId) => void;
}) {
  return (
    <div className="mx-auto flex max-w-[1180px] gap-[10px] overflow-x-auto px-6 py-5">
      {categories.map((c) => {
        const active = c.id === activeCategory;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full px-[18px] py-[9px] text-[13.5px] font-bold transition-colors ${
              active
                ? "border border-navy bg-navy text-white"
                : "border border-stepper bg-white text-navy hover:border-navy"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
