import { describe, expect, it } from "vitest";

import {
  adjustmentCreateSchema,
  stockMovementCreateSchema,
  transferCreateSchema,
} from "@/domain/inventory/schemas";
import {
  isLowStockBalance,
  StockMovementReason,
} from "@/domain/inventory/types";
import { asEntityId } from "@/domain/shared";

describe("isLowStockBalance", () => {
  it("detects balances at or below the minimum", () => {
    expect(isLowStockBalance({ quantity: 2, minStock: 8 })).toBe(true);
    expect(isLowStockBalance({ quantity: 8, minStock: 8 })).toBe(true);
    expect(isLowStockBalance({ quantity: 9, minStock: 8 })).toBe(false);
  });
});

describe("stockMovementCreateSchema", () => {
  it("rejects a zero quantity", () => {
    const result = stockMovementCreateSchema.safeParse({
      productId: asEntityId("PRD-0001"),
      branchId: asEntityId("BR-LM"),
      reason: StockMovementReason.Adjustment,
      quantity: 0,
    });

    expect(result.success).toBe(false);
  });
});

describe("transferCreateSchema", () => {
  it("requires different branches and at least one line", () => {
    const sameBranch = transferCreateSchema.safeParse({
      fromBranchId: asEntityId("BR-LM"),
      toBranchId: asEntityId("BR-LM"),
      lines: [{ productId: asEntityId("PRD-0001"), quantity: 2 }],
    });
    expect(sameBranch.success).toBe(false);

    const valid = transferCreateSchema.safeParse({
      fromBranchId: asEntityId("BR-LM"),
      toBranchId: asEntityId("BR-SU"),
      lines: [{ productId: asEntityId("PRD-0001"), quantity: 2 }],
    });
    expect(valid.success).toBe(true);
  });
});

describe("adjustmentCreateSchema", () => {
  it("rejects a negative new quantity", () => {
    const result = adjustmentCreateSchema.safeParse({
      productId: asEntityId("PRD-0001"),
      branchId: asEntityId("BR-LM"),
      newQuantity: -1,
      reason: "Merma",
    });

    expect(result.success).toBe(false);
  });
});
