import { describe, expect, it } from "vitest";

import { ExpenseCategory } from "@/domain/purchases";
import { asEntityId, money } from "@/domain/shared";
import { inventoryService } from "@/mocks/inventory/service";
import {
  PurchasesNotFoundError,
  createPurchasesService,
} from "@/mocks/purchases/service";

const NEW_PURCHASE = {
  supplierId: asEntityId("SUP-0004"),
  branchId: asEntityId("BR-LM"),
  lines: [
    {
      productId: asEntityId("PRD-0002"),
      description: "Pastillas de freno Bosch",
      quantity: 5,
      unitCost: money(8200),
    },
  ],
};

describe("purchasesService reads", () => {
  it("lists orders, quotes and expenses", async () => {
    const service = createPurchasesService();

    expect((await service.listOrders()).pagination.total).toBe(2);
    expect((await service.listQuotes()).pagination.total).toBe(2);
    expect(
      (await service.listExpenses({ pageSize: 100 })).pagination.total,
    ).toBe(3);
  });
});

describe("purchasesService.createPurchase and receivePurchase", () => {
  it("creates and receives a purchase, increasing stock", async () => {
    const service = createPurchasesService();

    const before = await inventoryService.getStock(
      asEntityId("PRD-0002"),
      asEntityId("BR-LM"),
    );
    expect(before[0]?.quantity).toBe(2);

    const created = await service.createPurchase(NEW_PURCHASE);
    expect(created.code).toBe("COM-2026-0003");
    expect(created.status).toBe("draft");
    expect(created.totals.total.amount).toBe(48380);

    const received = await service.receivePurchase(created.id);
    expect(received.status).toBe("received");
    expect(received.purchasedAt).toBeTruthy();

    const after = await inventoryService.getStock(
      asEntityId("PRD-0002"),
      asEntityId("BR-LM"),
    );
    expect(after[0]?.quantity).toBe(7);
  });

  it("rejects receiving an unknown purchase", async () => {
    const service = createPurchasesService();

    await expect(
      service.receivePurchase(asEntityId("PU-9999")),
    ).rejects.toBeInstanceOf(PurchasesNotFoundError);
  });
});

describe("purchasesService.createExpense", () => {
  it("records an expense without moving stock", async () => {
    const service = createPurchasesService();
    const before = await inventoryService.getStock(
      asEntityId("PRD-0001"),
      asEntityId("BR-LM"),
    );

    const created = await service.createExpense({
      branchId: asEntityId("BR-LM"),
      category: ExpenseCategory.Utilities,
      description: "Recibo de agua",
      amount: money(12000),
      igv: money(2160),
      incurredAt: "2026-02-20T00:00:00.000Z",
    });

    expect(created.code).toBe("GAS-2026-0004");
    expect(created.total.amount).toBe(14160);

    const after = await inventoryService.getStock(
      asEntityId("PRD-0001"),
      asEntityId("BR-LM"),
    );
    expect(after[0]?.quantity).toBe(before[0]?.quantity);
  });
});
