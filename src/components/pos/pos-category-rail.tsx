import { LayoutGrid } from "lucide-react";

import {
  POS_CATEGORIES,
  type PosCategoryKey,
} from "@/components/pos/pos-catalog";
import { cn } from "@/lib/utils";

export type PosCategoryFilter = PosCategoryKey | "all";

export function PosCategoryRail({
  value,
  counts,
  onChange,
}: {
  value: PosCategoryFilter;
  counts: Record<PosCategoryFilter, number>;
  onChange: (value: PosCategoryFilter) => void;
}) {
  const categories = POS_CATEGORIES.filter(
    (category) => counts[category.key] > 0,
  );

  return (
    <nav
      aria-label="Categorías del catálogo"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 xl:mx-0 xl:flex-col xl:overflow-visible xl:px-0 xl:pb-0"
    >
      <RailButton
        active={value === "all"}
        label="Todos"
        count={counts.all}
        onClick={() => onChange("all")}
      >
        <LayoutGrid className="size-6" aria-hidden />
      </RailButton>
      {categories.map((category) => (
        <RailButton
          key={category.key}
          active={value === category.key}
          label={category.label}
          count={counts[category.key]}
          onClick={() => onChange(category.key)}
        >
          <img
            src={category.image}
            alt=""
            className="size-9 object-contain"
            loading="lazy"
          />
        </RailButton>
      ))}
    </nav>
  );
}

function RailButton({
  active,
  label,
  count,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative flex w-[5.5rem] shrink-0 flex-col items-center gap-1.5 rounded-xl border bg-card px-2 py-3 text-center shadow-xs transition-all",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm",
        active
          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
          : "border-border text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "grid size-11 place-items-center rounded-lg transition-colors",
          active ? "bg-primary/10" : "bg-muted/60 group-hover:bg-muted",
        )}
      >
        {children}
      </span>
      <span
        className={cn(
          "text-[11px] font-semibold leading-tight",
          active ? "text-primary" : "text-foreground",
        )}
      >
        {label}
      </span>
      <span className="absolute right-1.5 top-1.5 rounded-full bg-muted px-1.5 text-[9px] font-bold tabular-nums text-muted-foreground">
        {count}
      </span>
    </button>
  );
}
