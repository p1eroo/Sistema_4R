import { Check, Minus, Plus, Wrench } from "lucide-react";

import {
  POS_CATEGORIES,
  type PosCatalogItem,
} from "@/components/pos/pos-catalog";
import { PosLineKind } from "@/domain/pos";
import { formatMoney } from "@/domain/shared";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS = new Map(
  POS_CATEGORIES.map((category) => [category.key, category.label]),
);

export function PosProductCard({
  item,
  quantity,
  disabled,
  onAdd,
  onDecrement,
}: {
  item: PosCatalogItem;
  quantity: number;
  disabled: boolean;
  onAdd: () => void;
  onDecrement: () => void;
}) {
  const isService = item.kind === PosLineKind.Service;
  const stock = item.stock;
  const outOfStock = !isService && stock !== undefined && stock <= 0;
  const reachedStock =
    !isService && stock !== undefined && quantity >= stock && stock > 0;
  const lowStock =
    !isService &&
    stock !== undefined &&
    item.minStock !== undefined &&
    stock > 0 &&
    stock <= item.minStock;
  const selected = quantity > 0;
  const blockAdd = disabled || outOfStock || reachedStock;

  return (
    <article
      className={cn(
        "group relative flex min-w-0 flex-col rounded-xl border bg-card p-3 shadow-xs transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        selected
          ? "border-success ring-1 ring-success/30"
          : "border-border hover:border-primary/40",
        outOfStock && "opacity-70",
      )}
    >
      <button
        type="button"
        onClick={onAdd}
        disabled={blockAdd}
        className="relative block w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted/70 via-muted/30 to-background text-left disabled:cursor-not-allowed"
        aria-label={`Agregar ${item.name}`}
      >
        <div className="aspect-[5/4] w-full p-3">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="size-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <span
          className={cn(
            "absolute left-2 top-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
            isService
              ? "bg-primary/10 text-primary"
              : outOfStock
                ? "bg-destructive/10 text-destructive"
                : lowStock
                  ? "bg-warning/15 text-warning-foreground"
                  : "bg-success/10 text-success",
          )}
        >
          {isService ? (
            <>
              <Wrench className="size-3" aria-hidden />
              Servicio
            </>
          ) : outOfStock ? (
            "Agotado"
          ) : (
            `Stock ${stock ?? 0}`
          )}
        </span>
        {selected ? (
          <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-success text-white shadow-sm">
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
          </span>
        ) : null}
      </button>

      <div className="mt-3 min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-muted-foreground">
          {CATEGORY_LABELS.get(item.category) ?? "Catálogo"}
          {item.brand ? ` · ${item.brand}` : ""}
        </p>
        <h3 className="mt-0.5 line-clamp-2 min-h-9 text-[13px] font-bold leading-snug text-foreground">
          {item.name}
        </h3>
        <p className="truncate font-mono text-[10px] text-muted-foreground">
          {item.sku}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-border pt-3">
        <p className="text-sm font-extrabold tabular-nums text-foreground">
          {formatMoney(item.price)}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onDecrement}
            disabled={disabled || quantity === 0}
            aria-label={`Quitar una unidad de ${item.name}`}
            className="grid size-6 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive disabled:opacity-40"
          >
            <Minus className="size-3" />
          </button>
          <span
            className={cn(
              "min-w-5 text-center text-xs font-bold tabular-nums",
              selected ? "text-foreground" : "text-muted-foreground",
            )}
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={onAdd}
            disabled={blockAdd}
            aria-label={`Agregar una unidad de ${item.name}`}
            className="grid size-6 place-items-center rounded-full border border-primary/30 bg-primary/5 text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>
    </article>
  );
}
