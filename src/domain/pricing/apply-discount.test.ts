import { describe, expect, it } from "vitest";

import {
  applyDiscount,
  calculateDiscountAmount,
  pickBestDiscount,
} from "@/domain/pricing/apply-discount";
import { DiscountType, type Discount } from "@/domain/pricing/types";
import { money } from "@/domain/shared";

const tenPercent: Discount = { type: DiscountType.Percentage, value: 10 };
const twentyFixed: Discount = { type: DiscountType.FixedAmount, value: 2000 };

describe("calculateDiscountAmount", () => {
  it("computes percentage discounts on cents", () => {
    expect(calculateDiscountAmount(money(250000), tenPercent).amount).toBe(
      25000,
    );
    expect(calculateDiscountAmount(money(999), tenPercent).amount).toBe(100);
  });

  it("caps a percentage discount with maxAmount", () => {
    const capped: Discount = {
      type: DiscountType.Percentage,
      value: 50,
      maxAmount: money(3000),
    };

    expect(calculateDiscountAmount(money(250000), capped).amount).toBe(3000);
  });

  it("never exceeds the original amount", () => {
    expect(calculateDiscountAmount(money(1500), twentyFixed).amount).toBe(1500);
    expect(calculateDiscountAmount(money(0), twentyFixed).amount).toBe(0);
  });
});

describe("applyDiscount", () => {
  it("returns the remaining amount", () => {
    expect(applyDiscount(money(250000), tenPercent).amount).toBe(225000);
    expect(applyDiscount(money(1500), twentyFixed).amount).toBe(0);
  });
});

describe("pickBestDiscount", () => {
  it("picks the discount with the largest amount without stacking", () => {
    const best = pickBestDiscount(money(250000), [tenPercent, twentyFixed]);

    expect(best).toBe(tenPercent);
    expect(pickBestDiscount(money(10000), [])).toBeUndefined();
  });
});
