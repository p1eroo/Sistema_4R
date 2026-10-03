import { describe, expect, it } from "vitest";

import {
  filterKardexByDate,
  signedQuantity,
} from "@/components/inventory/kardex-filter";
import { StockMovementReason } from "@/domain/inventory";
import { asEntityId } from "@/domain/shared";

const pastillas = [
  {
    id: asEntityId("MOV-0001"),
    productId: asEntityId("PRD-0002"),
    branchId: asEntityId("BR-LM"),
    reason: StockMovementReason.Initial,
    quantity: 10,
    balanceAfter: 10,
    createdAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: asEntityId("MOV-0002"),
    productId: asEntityId("PRD-0002"),
    branchId: asEntityId("BR-LM"),
    reason: StockMovementReason.Sale,
    quantity: -8,
    balanceAfter: 2,
    createdAt: "2026-02-01T11:30:00.000Z",
  },
];

describe("filterKardexByDate", () => {
  it("keeps the February sale when filtering from 2026-02-01", () => {
    const filtered = filterKardexByDate(pastillas, "2026-02-01", "2026-02-28");

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("MOV-0002");
    expect(filtered[0]?.quantity).toBe(-8);
    expect(filtered[0]?.balanceAfter).toBe(2);
  });

  it("returns the full ledger without dates", () => {
    expect(filterKardexByDate(pastillas)).toHaveLength(2);
  });
});

describe("signedQuantity", () => {
  it("prefixes entries", () => {
    expect(signedQuantity(10)).toBe("+10");
    expect(signedQuantity(-8)).toBe("-8");
  });
});
