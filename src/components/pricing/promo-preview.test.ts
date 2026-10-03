import { describe, expect, it } from "vitest";

import {
  formatDiscountLabel,
  formatPromoPreview,
  previewDiscountedPrice,
} from "@/components/pricing/promo-preview";
import { applyDiscount, DiscountType } from "@/domain/pricing";
import { money } from "@/domain/shared";

const tenPercent = { type: DiscountType.Percentage, value: 10 } as const;
const twentyFixed = { type: DiscountType.FixedAmount, value: 2000 } as const;

describe("promo preview", () => {
  it("delegates the remaining amount to applyDiscount", () => {
    const amount = money(18000);
    expect(previewDiscountedPrice(amount, tenPercent)).toEqual(
      applyDiscount(amount, tenPercent),
    );
    expect(formatPromoPreview(amount, tenPercent)).toEqual({
      original: "S/ 180.00",
      final: "S/ 162.00",
      saved: "S/ 18.00",
    });
  });

  it("labels percentage and fixed discounts", () => {
    expect(formatDiscountLabel(tenPercent)).toBe("10%");
    expect(formatDiscountLabel(twentyFixed)).toBe("S/ 20.00");
  });
});
