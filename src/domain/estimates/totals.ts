import type { EstimateLine } from "@/domain/estimates/types";
import { money, PEN, type Money } from "@/domain/shared";

export const DEFAULT_IGV_RATE = 0.18;

export type EstimateTotals = {
  readonly subtotal: Money;
  readonly discount: Money;
  readonly igv: Money;
  readonly total: Money;
};

export type EstimateTotalsOptions = {
  readonly globalDiscount?: Money;
  readonly igvRate?: number;
};

export function calculateEstimateTotals(
  lines: readonly EstimateLine[],
  options: EstimateTotalsOptions = {},
): EstimateTotals {
  const currency = lines[0]?.unitPrice.currency ?? PEN;

  const subtotalAmount = lines.reduce(
    (acc, line) => acc + line.quantity * line.unitPrice.amount,
    0,
  );
  const lineDiscountAmount = lines.reduce(
    (acc, line) => acc + (line.discount?.amount ?? 0),
    0,
  );
  const discountAmount = Math.min(
    subtotalAmount,
    lineDiscountAmount + (options.globalDiscount?.amount ?? 0),
  );
  const taxableAmount = subtotalAmount - discountAmount;
  const igvRate = options.igvRate ?? DEFAULT_IGV_RATE;
  const igvAmount = Math.round(taxableAmount * igvRate);

  return {
    subtotal: money(subtotalAmount, currency),
    discount: money(discountAmount, currency),
    igv: money(igvAmount, currency),
    total: money(taxableAmount + igvAmount, currency),
  };
}
