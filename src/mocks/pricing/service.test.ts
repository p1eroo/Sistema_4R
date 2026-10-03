import { describe, expect, it } from "vitest";

import {
  DiscountType,
  PromotionScope,
  PromotionStatus,
} from "@/domain/pricing";
import { asEntityId } from "@/domain/shared";
import {
  PromotionValidationError,
  createPricingService,
} from "@/mocks/pricing/service";

describe("pricingService", () => {
  it("lists only active promotions", async () => {
    const service = createPricingService();
    const active = await service.listActive({ pageSize: 100 });

    expect(active.pagination.total).toBe(2);
    expect(
      active.items.every(
        (promotion) => promotion.status === PromotionStatus.Active,
      ),
    ).toBe(true);
  });

  it("creates and archives promotions", async () => {
    const service = createPricingService();
    const created = await service.create({
      code: "verano-15",
      name: "15% de verano",
      discount: { type: DiscountType.Percentage, value: 15 },
      scope: PromotionScope.Products,
      targetIds: [asEntityId("PRD-0001")],
    });

    expect(created.id).toBe("PROMO-0004");
    expect(created.code).toBe("VERANO-15");

    await expect(
      service.create({
        code: "MANT-10",
        name: "Duplicada",
        discount: { type: DiscountType.Percentage, value: 10 },
        scope: PromotionScope.Services,
        targetIds: [asEntityId("SRV-0001")],
      }),
    ).rejects.toBeInstanceOf(PromotionValidationError);

    const archived = await service.archive(asEntityId("PROMO-0001"));
    expect(archived.status).toBe(PromotionStatus.Inactive);

    const active = await service.listActive({ pageSize: 100 });
    expect(active.items.map((promotion) => promotion.id)).not.toContain(
      "PROMO-0001",
    );
  });
});
