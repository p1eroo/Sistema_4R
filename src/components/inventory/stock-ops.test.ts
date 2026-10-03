import { describe, expect, it } from "vitest";

import {
  INSUFFICIENT_STOCK_MESSAGE,
  MISSING_BALANCE_MESSAGE,
  PHYSICAL_COUNT_REASON,
  planPhysicalAdjustments,
  planReturnQuantity,
} from "@/components/inventory/stock-ops";
import { StockReturnDirection } from "@/domain/inventory";
import { asEntityId } from "@/domain/shared";

describe("planReturnQuantity", () => {
  it("rejects a supplier return without enough stock", () => {
    expect(planReturnQuantity(2, StockReturnDirection.ToSupplier, 5)).toEqual({
      ok: false,
      message: INSUFFICIENT_STOCK_MESSAGE,
    });
  });

  it("adds stock for a customer return", () => {
    expect(planReturnQuantity(2, StockReturnDirection.FromCustomer, 1)).toEqual(
      { ok: true, newQuantity: 3 },
    );
  });

  it("rejects a return without a balance", () => {
    expect(
      planReturnQuantity(undefined, StockReturnDirection.FromCustomer, 1),
    ).toEqual({ ok: false, message: MISSING_BALANCE_MESSAGE });
  });
});

describe("planPhysicalAdjustments", () => {
  it("emits adjustments only for counted differences", () => {
    const branchId = asEntityId("BR-LM");
    const plans = planPhysicalAdjustments(branchId, [
      { productId: asEntityId("PRD-0002"), expected: 2, counted: 3 },
      { productId: asEntityId("PRD-0001"), expected: 4, counted: 4 },
    ]);

    expect(plans).toEqual([
      {
        productId: "PRD-0002",
        branchId: "BR-LM",
        newQuantity: 3,
        reason: PHYSICAL_COUNT_REASON,
      },
    ]);
  });
});
