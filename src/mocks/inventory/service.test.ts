import { beforeEach, describe, expect, it } from "vitest";

import { StockMovementReason } from "@/domain/inventory";
import { asEntityId } from "@/domain/shared";
import {
  InventoryValidationError,
  createInventoryService,
  type InventoryService,
} from "@/mocks/inventory/service";

let service: InventoryService;

beforeEach(() => {
  service = createInventoryService();
});

describe("inventoryService stock", () => {
  it("lists exactly seven critical balances", async () => {
    const critical = await service.listCritical();

    expect(critical).toHaveLength(7);
  });

  it("marks two balances without restock", async () => {
    const withoutRestock = await service.listWithoutRestock();

    expect(withoutRestock).toHaveLength(2);
    expect(
      withoutRestock.every((balance) => balance.restockable === false),
    ).toBe(true);
  });

  it("returns the stock of a product in a branch", async () => {
    const stock = await service.getStock(
      asEntityId("PRD-0002"),
      asEntityId("BR-LM"),
    );

    expect(stock).toHaveLength(1);
    expect(stock[0]?.quantity).toBe(2);
    expect(stock[0]?.minStock).toBe(8);
  });
});

describe("inventoryService kardex", () => {
  it("has movements for the brake pads ending at the current balance", async () => {
    const kardex = await service.kardex(asEntityId("PRD-0002"));

    expect(kardex.length).toBeGreaterThanOrEqual(2);
    expect(kardex[kardex.length - 1]?.balanceAfter).toBe(2);
    expect(kardex[0]?.reason).toBe(StockMovementReason.Initial);
  });
});

describe("inventoryService transfer", () => {
  it("moves stock between branches and records both movements", async () => {
    const transfer = await service.transfer({
      fromBranchId: asEntityId("BR-LM"),
      toBranchId: asEntityId("BR-SU"),
      lines: [{ productId: asEntityId("PRD-0004"), quantity: 4 }],
    });

    expect(transfer.code).toBe("TRF-2026-0001");
    expect(transfer.status).toBe("received");

    const from = await service.getStock(
      asEntityId("PRD-0004"),
      asEntityId("BR-LM"),
    );
    const to = await service.getStock(
      asEntityId("PRD-0004"),
      asEntityId("BR-SU"),
    );
    expect(from[0]?.quantity).toBe(20);
    expect(to[0]?.quantity).toBe(9);

    const movements = await service.listMovements(asEntityId("PRD-0004"));
    expect(
      movements.some(
        (movement) => movement.reason === StockMovementReason.TransferOut,
      ),
    ).toBe(true);
    expect(
      movements.some(
        (movement) => movement.reason === StockMovementReason.TransferIn,
      ),
    ).toBe(true);
  });

  it("rejects a transfer without enough stock", async () => {
    await expect(
      service.transfer({
        fromBranchId: asEntityId("BR-LM"),
        toBranchId: asEntityId("BR-SU"),
        lines: [{ productId: asEntityId("PRD-0002"), quantity: 99 }],
      }),
    ).rejects.toBeInstanceOf(InventoryValidationError);
  });
});

describe("inventoryService adjust", () => {
  it("adjusts a balance and appends a movement", async () => {
    const adjustment = await service.adjust({
      productId: asEntityId("PRD-0002"),
      branchId: asEntityId("BR-LM"),
      newQuantity: 20,
      reason: "Reposición de proveedor",
    });

    expect(adjustment.code).toBe("AJU-2026-0001");
    expect(adjustment.quantity).toBe(18);

    const stock = await service.getStock(
      asEntityId("PRD-0002"),
      asEntityId("BR-LM"),
    );
    expect(stock[0]?.quantity).toBe(20);

    const kardex = await service.kardex(
      asEntityId("PRD-0002"),
      asEntityId("BR-LM"),
    );
    expect(kardex[kardex.length - 1]?.reason).toBe(
      StockMovementReason.Adjustment,
    );
    expect(kardex[kardex.length - 1]?.balanceAfter).toBe(20);
  });

  it("rejects adjusting a balance that does not exist", async () => {
    await expect(
      service.adjust({
        productId: asEntityId("PRD-0009"),
        branchId: asEntityId("BR-LM"),
        newQuantity: 1,
        reason: "Conteo",
      }),
    ).rejects.toBeInstanceOf(InventoryValidationError);
  });
});
