import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import {
  CASH_MOVEMENT_TYPE_LABELS,
  cashMovementSign,
  type CashMovement,
} from "@/domain/cash";
import { formatMoney } from "@/domain/shared";
import { cn } from "@/lib/utils";

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(new Date(value));
}

/** Lista de movimientos de una sesión de caja (más reciente primero). */
export function CashMovementsList({
  movements,
}: {
  movements: readonly CashMovement[];
}) {
  if (movements.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-xs text-muted-foreground">
        La sesión aún no registra movimientos.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-white/50">
      {[...movements]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((movement) => {
          const inflow = cashMovementSign(movement.type) > 0;
          return (
            <li
              key={movement.id}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full",
                  inflow
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {inflow ? (
                  <ArrowDownLeft className="size-4" aria-hidden />
                ) : (
                  <ArrowUpRight className="size-4" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">
                  {CASH_MOVEMENT_TYPE_LABELS[movement.type]}
                  {movement.reference ? ` · ${movement.reference}` : ""}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {movement.notes ?? "Sin detalle"} ·{" "}
                  {formatTime(movement.createdAt)}
                </p>
              </div>
              <p
                className={cn(
                  "text-xs font-bold tabular-nums",
                  inflow ? "text-success" : "text-destructive",
                )}
              >
                {inflow ? "+" : "−"}
                {formatMoney(movement.amount)}
              </p>
            </li>
          );
        })}
    </ul>
  );
}
