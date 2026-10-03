import { describe, expect, it } from "vitest";

import { calculateEstimateTotals } from "@/domain/estimates/totals";
import { EstimateLineKind, type EstimateLine } from "@/domain/estimates/types";
import { asEntityId, money } from "@/domain/shared";

function line(
  unitPrice: number,
  quantity = 1,
  discount?: number,
): EstimateLine {
  return {
    id: asEntityId("L1"),
    kind: EstimateLineKind.Labor,
    name: "Servicio",
    quantity,
    unitPrice: money(unitPrice),
    ...(discount !== undefined ? { discount: money(discount) } : {}),
  };
}

describe("calculateEstimateTotals", () => {
  it("returns zeros for no lines", () => {
    expect(calculateEstimateTotals([])).toEqual({
      subtotal: { amount: 0, currency: "PEN" },
      discount: { amount: 0, currency: "PEN" },
      igv: { amount: 0, currency: "PEN" },
      total: { amount: 0, currency: "PEN" },
    });
  });

  it("computes subtotal, 18% IGV and total", () => {
    const totals = calculateEstimateTotals([line(250000)]);

    expect(totals.subtotal.amount).toBe(250000);
    expect(totals.igv.amount).toBe(45000);
    expect(totals.total.amount).toBe(295000);
  });

  it("multiplies quantity and applies line discounts", () => {
    const totals = calculateEstimateTotals([line(50000, 3, 10000)]);

    expect(totals.subtotal.amount).toBe(150000);
    expect(totals.discount.amount).toBe(10000);
    expect(totals.igv.amount).toBe(25200);
    expect(totals.total.amount).toBe(165200);
  });

  it("applies a global discount before IGV", () => {
    const totals = calculateEstimateTotals([line(100000)], {
      globalDiscount: money(20000),
    });

    expect(totals.discount.amount).toBe(20000);
    expect(totals.igv.amount).toBe(14400);
    expect(totals.total.amount).toBe(94400);
  });

  it("supports a configurable IGV rate", () => {
    const totals = calculateEstimateTotals([line(100000)], { igvRate: 0.1 });

    expect(totals.igv.amount).toBe(10000);
    expect(totals.total.amount).toBe(110000);
  });
});
