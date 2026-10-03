import { describe, expect, it } from "vitest";

import { posCheckoutSchema, posTicketDraftSchema } from "@/domain/pos/schemas";
import {
  calculatePosTotals,
  PaymentMethod,
  PosLineKind,
  sumPayments,
  type PosTotalsLine,
} from "@/domain/pos/types";
import { asEntityId, money } from "@/domain/shared";

const lines: PosTotalsLine[] = [
  { quantity: 2, unitPrice: money(10000) },
  { quantity: 1, unitPrice: money(5000), discount: money(1000) },
];

describe("calculatePosTotals", () => {
  it("computes subtotal, discount, IGV and total", () => {
    const totals = calculatePosTotals(lines);

    expect(totals.subtotal.amount).toBe(25000);
    expect(totals.discount.amount).toBe(1000);
    expect(totals.igv.amount).toBe(4320);
    expect(totals.total.amount).toBe(28320);
  });
});

describe("sumPayments", () => {
  it("adds mixed payments", () => {
    const total = sumPayments([
      {
        id: asEntityId("P1"),
        method: PaymentMethod.Cash,
        amount: money(10000),
      },
      { id: asEntityId("P2"), method: PaymentMethod.Yape, amount: money(5000) },
    ]);

    expect(total.amount).toBe(15000);
  });
});

describe("posCheckoutSchema", () => {
  const base = {
    branchId: asEntityId("BR-LM"),
    lines: [
      {
        kind: PosLineKind.Product,
        description: "Aceite 5W30",
        quantity: 2,
        unitPrice: money(10000),
      },
    ],
  };

  it("accepts payments that cover the total", () => {
    const result = posCheckoutSchema.safeParse({
      ...base,
      payments: [{ method: PaymentMethod.Cash, amount: money(23600) }],
    });

    expect(result.success).toBe(true);
  });

  it("rejects payments that do not cover the total", () => {
    const result = posCheckoutSchema.safeParse({
      ...base,
      payments: [{ method: PaymentMethod.Cash, amount: money(10000) }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Los pagos no cubren el total del ticket.",
      );
    }
  });
});

describe("posTicketDraftSchema", () => {
  it("allows an empty cart", () => {
    const result = posTicketDraftSchema.safeParse({
      branchId: asEntityId("BR-LM"),
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lines).toEqual([]);
    }
  });
});
