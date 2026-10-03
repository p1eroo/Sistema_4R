import { DEFAULT_IGV_RATE } from "@/domain/estimates";
import type { PurchaseLine, PurchaseTotals } from "@/domain/purchases";
import { money } from "@/domain/shared";

export function calculatePurchaseTotals(
  lines: readonly PurchaseLine[],
  igvRate: number = DEFAULT_IGV_RATE,
): PurchaseTotals {
  const currency = lines[0]?.unitCost.currency ?? "PEN";

  const subtotal = lines.reduce(
    (acc, line) => acc + line.quantity * line.unitCost.amount,
    0,
  );
  const discount = Math.min(
    subtotal,
    lines.reduce((acc, line) => acc + (line.discount?.amount ?? 0), 0),
  );
  const base = subtotal - discount;
  const igv = Math.round(base * igvRate);

  return {
    subtotal: money(subtotal, currency),
    discount: money(discount, currency),
    igv: money(igv, currency),
    total: money(base + igv, currency),
  };
}
