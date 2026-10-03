import { describe, expect, it } from "vitest";

import {
  EMPTY_LINES_MESSAGE,
  buildPurchaseLines,
  previewPurchaseTotals,
} from "@/components/purchases/purchase-draft";
import { asEntityId, money } from "@/domain/shared";
import { calculatePurchaseTotals } from "@/mocks/purchases/totals";

describe("buildPurchaseLines", () => {
  it("rejects empty lines", () => {
    const result = buildPurchaseLines([
      {
        key: "1",
        productId: "",
        description: "   ",
        quantity: "1",
        unitCostSoles: "82",
      },
    ]);

    expect(result).toEqual({
      ok: false,
      message: EMPTY_LINES_MESSAGE,
    });
  });

  it("builds a product line and matches calculatePurchaseTotals", () => {
    const result = buildPurchaseLines([
      {
        key: "1",
        productId: "PRD-0002",
        description: "Pastillas de freno Bosch",
        quantity: "5",
        unitCostSoles: "82",
      },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.lines[0]?.productId).toBe("PRD-0002");
    expect(result.lines[0]?.quantity).toBe(5);
    expect(result.lines[0]?.unitCost.amount).toBe(8200);

    const preview = previewPurchaseTotals([
      {
        key: "1",
        productId: "PRD-0002",
        description: "Pastillas de freno Bosch",
        quantity: "5",
        unitCostSoles: "82",
      },
    ]);
    const expected = calculatePurchaseTotals([
      {
        id: asEntityId("PREVIEW-1"),
        description: "Pastillas de freno Bosch",
        quantity: 5,
        unitCost: money(8200),
        igvRate: 0.18,
      },
    ]);

    expect(preview.total.amount).toBe(expected.total.amount);
    expect(preview.total.amount).toBe(48380);
  });
});
