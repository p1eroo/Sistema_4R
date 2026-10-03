import { describe, expect, it } from "vitest";

import { PaymentMethod, PosLineKind, PosStatus } from "@/domain/pos";
import { asEntityId, money } from "@/domain/shared";
import { inventoryService } from "@/mocks/inventory/service";
import { PosValidationError, createPosService } from "@/mocks/pos/service";

const ACEITE_LINE = {
  kind: PosLineKind.Product,
  productId: asEntityId("PRD-0004"),
  description: "Aceite 5W30 Mobil",
  quantity: 6,
  unitPrice: money(8000),
};

describe("posService seed", () => {
  it("contains the reference invoice F001-00982", async () => {
    const service = createPosService();
    const ticket = await service.getById(asEntityId("TK-0001"));

    expect(ticket?.documentNumber).toBe("F001-00982");
    expect(ticket?.totals.total.amount).toBe(128000);
    expect(ticket?.status).toBe(PosStatus.Paid);
  });
});

describe("posService createTicket and addLine", () => {
  it("creates a ticket and recomputes totals when adding a line", async () => {
    const service = createPosService();
    const ticket = await service.createTicket({
      branchId: asEntityId("BR-LM"),
      customerId: asEntityId("CUS-0001"),
    });
    expect(ticket.status).toBe(PosStatus.Draft);
    expect(ticket.totals.total.amount).toBe(0);

    const withLine = await service.addLine(ticket.id, ACEITE_LINE);
    expect(withLine.lines).toHaveLength(1);
    expect(withLine.totals.subtotal.amount).toBe(48000);
    expect(withLine.totals.total.amount).toBe(56640);
  });
});

describe("posService pay", () => {
  it("charges a ticket and reduces stock", async () => {
    const service = createPosService();

    const before = await inventoryService.getStock(
      asEntityId("PRD-0004"),
      asEntityId("BR-LM"),
    );
    expect(before[0]?.quantity).toBe(24);

    const ticket = await service.createTicket({
      branchId: asEntityId("BR-LM"),
    });
    const withLine = await service.addLine(ticket.id, ACEITE_LINE);
    const paid = await service.pay(withLine.id, [
      { method: PaymentMethod.Cash, amount: withLine.totals.total },
    ]);

    expect(paid.status).toBe(PosStatus.Paid);
    expect(paid.documentNumber).toBe("F001-00983");
    expect(paid.paidAmount.amount).toBe(56640);
    expect(paid.change.amount).toBe(0);

    const after = await inventoryService.getStock(
      asEntityId("PRD-0004"),
      asEntityId("BR-LM"),
    );
    expect(after[0]?.quantity).toBe(18);

    const kardex = await inventoryService.kardex(
      asEntityId("PRD-0004"),
      asEntityId("BR-LM"),
    );
    expect(kardex[kardex.length - 1]?.quantity).toBe(-6);
  });

  it("rejects payments that do not cover the total", async () => {
    const service = createPosService();
    const ticket = await service.createTicket({
      branchId: asEntityId("BR-LM"),
    });
    const withLine = await service.addLine(ticket.id, ACEITE_LINE);

    await expect(
      service.pay(withLine.id, [
        { method: PaymentMethod.Cash, amount: money(1000) },
      ]),
    ).rejects.toBeInstanceOf(PosValidationError);
  });

  it("fails when there is not enough stock", async () => {
    const service = createPosService();
    const ticket = await service.createTicket({
      branchId: asEntityId("BR-LM"),
    });
    const withLine = await service.addLine(ticket.id, {
      kind: PosLineKind.Product,
      productId: asEntityId("PRD-0002"),
      description: "Pastillas de freno",
      quantity: 99,
      unitPrice: money(8200),
    });

    await expect(
      service.pay(withLine.id, [
        { method: PaymentMethod.Cash, amount: withLine.totals.total },
      ]),
    ).rejects.toBeInstanceOf(PosValidationError);
  });
});

describe("posService ticket editing", () => {
  it("merges repeated products and updates or removes lines", async () => {
    const service = createPosService();
    const ticket = await service.createTicket({
      branchId: asEntityId("BR-LM"),
    });
    await service.addLine(ticket.id, { ...ACEITE_LINE, quantity: 1 });
    const merged = await service.addLine(ticket.id, {
      ...ACEITE_LINE,
      quantity: 1,
    });

    expect(merged.lines).toHaveLength(1);
    expect(merged.lines[0]?.quantity).toBe(2);

    const lineId = merged.lines[0]!.id;
    const updated = await service.updateLineQuantity(ticket.id, lineId, 3);
    expect(updated.totals.subtotal.amount).toBe(24000);

    const emptied = await service.updateLineQuantity(ticket.id, lineId, 0);
    expect(emptied.lines).toHaveLength(0);
    expect(emptied.totals.total.amount).toBe(0);
  });

  it("applies a global discount and rounding to S/ 0.10", async () => {
    const service = createPosService();
    const ticket = await service.createTicket({
      branchId: asEntityId("BR-LM"),
    });
    await service.addLine(ticket.id, {
      ...ACEITE_LINE,
      quantity: 1,
      unitPrice: money(4500),
    });
    const adjusted = await service.setAdjustments(ticket.id, {
      globalDiscount: money(500),
      roundTotal: true,
    });

    // (45.00 - 5.00) * 1.18 = 47.20 → ya redondeado.
    expect(adjusted.totals.discount.amount).toBe(500);
    expect(adjusted.totals.total.amount).toBe(4720);

    const rounded = await service.setAdjustments(ticket.id, {
      globalDiscount: money(1),
    });
    // (45.00 - 0.01) * 1.18 = 53.09 → baja a 53.00.
    expect(rounded.totals.rounding?.amount).toBe(-9);
    expect(rounded.totals.total.amount).toBe(5300);
  });

  it("holds, resumes and cancels tickets", async () => {
    const service = createPosService();
    const ticket = await service.createTicket({
      branchId: asEntityId("BR-LM"),
    });
    await expect(service.hold(ticket.id)).rejects.toBeInstanceOf(
      PosValidationError,
    );

    await service.addLine(ticket.id, { ...ACEITE_LINE, quantity: 1 });
    const held = await service.hold(ticket.id, "Cliente vuelve luego");
    expect(held.status).toBe(PosStatus.OnHold);
    await expect(
      service.addLine(ticket.id, ACEITE_LINE),
    ).rejects.toBeInstanceOf(PosValidationError);

    const resumed = await service.resume(ticket.id);
    expect(resumed.status).toBe(PosStatus.Draft);

    const cancelled = await service.cancel(ticket.id);
    expect(cancelled.status).toBe(PosStatus.Cancelled);
  });
});

describe("posService advance payments", () => {
  it("rejects an advance payment without customer", async () => {
    const service = createPosService();
    const ticket = await service.createTicket({
      branchId: asEntityId("BR-LM"),
    });
    await service.addLine(ticket.id, {
      ...ACEITE_LINE,
      quantity: 1,
      unitPrice: money(1000),
    });

    await expect(
      service.pay(ticket.id, [
        { method: PaymentMethod.Advance, amount: money(1180) },
      ]),
    ).rejects.toBeInstanceOf(PosValidationError);
  });
});
