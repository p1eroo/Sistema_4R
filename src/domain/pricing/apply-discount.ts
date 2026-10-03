import { DiscountType, type Discount } from "@/domain/pricing/types";
import { money, type Money } from "@/domain/shared";

/**
 * Regla simple: se aplica un único descuento por línea.
 * - Porcentaje: se redondea al céntimo más cercano y se puede topar con `maxAmount`.
 * - Monto fijo: nunca supera el importe original.
 * El descuento resultante nunca es negativo.
 */
export function calculateDiscountAmount(
  amount: Money,
  discount: Discount,
): Money {
  if (amount.amount <= 0) {
    return money(0, amount.currency);
  }

  let raw =
    discount.type === DiscountType.Percentage
      ? Math.round((amount.amount * discount.value) / 100)
      : discount.value;

  if (discount.maxAmount !== undefined) {
    raw = Math.min(raw, discount.maxAmount.amount);
  }

  return money(Math.min(Math.max(raw, 0), amount.amount), amount.currency);
}

export function applyDiscount(amount: Money, discount: Discount): Money {
  return money(
    amount.amount - calculateDiscountAmount(amount, discount).amount,
    amount.currency,
  );
}

export function pickBestDiscount(
  amount: Money,
  discounts: readonly Discount[],
): Discount | undefined {
  let best: Discount | undefined;
  let bestAmount = 0;

  for (const discount of discounts) {
    const value = calculateDiscountAmount(amount, discount).amount;
    if (value > bestAmount) {
      bestAmount = value;
      best = discount;
    }
  }

  return best;
}
