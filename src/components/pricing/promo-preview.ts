import { applyDiscount, DiscountType, type Discount } from "@/domain/pricing";
import { formatMoney, money, type Money } from "@/domain/shared";

export function previewDiscountedPrice(
  amount: Money,
  discount: Discount,
): Money {
  return applyDiscount(amount, discount);
}

export function formatDiscountLabel(discount: Discount): string {
  if (discount.type === DiscountType.Percentage) {
    return `${discount.value}%`;
  }

  return formatMoney(money(discount.value));
}

export function formatPromoPreview(
  amount: Money,
  discount: Discount,
): {
  readonly original: string;
  readonly final: string;
  readonly saved: string;
} {
  const finalPrice = applyDiscount(amount, discount);
  return {
    original: formatMoney(amount),
    final: formatMoney(finalPrice),
    saved: formatMoney(
      money(amount.amount - finalPrice.amount, amount.currency),
    ),
  };
}

export function dateKeyToIso(dateKey: string, endOfDay = false): string {
  return `${dateKey}T${endOfDay ? "23:59:59" : "00:00:00"}-05:00`;
}

export function isoToDateKey(value?: string): string {
  if (!value) {
    return "";
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return "";
  }

  return new Date(parsed).toLocaleDateString("en-CA", {
    timeZone: "America/Lima",
  });
}
