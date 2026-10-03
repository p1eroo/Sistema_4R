import { describe, expect, it } from "vitest";

import { PaymentMethod, PosLineKind, PosStatus } from "@/domain/pos";
import { asEntityId, formatMoney, money } from "@/domain/shared";
import { WorkOrderStatus } from "@/domain/work-orders/status";
import { canTransitionWorkOrder } from "@/domain/work-orders/transitions";
import { can } from "@/lib/can";
import { dashboardService } from "@/mocks/dashboard/service";
import { estimateService } from "@/mocks/estimates/service";
import { roleSeed, userSeed } from "@/mocks/identity/seed";
import { inventoryService } from "@/mocks/inventory/service";
import { createPosService } from "@/mocks/pos/service";

const BRANCH_LA_MOLINA = asEntityId("BR-LM");
const BRAKE_PADS = asEntityId("PRD-0002");
const OIL_5W30 = asEntityId("PRD-0004");

function userById(id: string) {
  const user = userSeed.find((item) => item.id === id);
  if (!user) {
    throw new Error(`seed sin usuario ${id}`);
  }
  return user;
}

describe("regression: dashboard canonical helpers", () => {
  it("formats money as S/ 1,280.00", () => {
    expect(formatMoney(money(128000))).toBe("S/ 1,280.00");
  });

  it("keeps pending estimates at S/ 8,940.00", async () => {
    const total = await estimateService.sumPendingApproval();

    expect(total.amount).toBe(894000);
  });

  it("keeps the work order slices 7/12/4/6", async () => {
    const snapshot = await dashboardService.getDashboardSnapshot();
    const byStatus = new Map(
      snapshot.workOrderSlices.map((slice) => [slice.status, slice.value]),
    );

    expect(byStatus.get(WorkOrderStatus.Diagnosis)).toBe(7);
    expect(byStatus.get(WorkOrderStatus.InRepair)).toBe(12);
    expect(byStatus.get(WorkOrderStatus.Quality)).toBe(4);
    expect(byStatus.get(WorkOrderStatus.Ready)).toBe(6);
  });

  it("blocks diagnosis to delivered but allows the linear flow", () => {
    expect(
      canTransitionWorkOrder(
        WorkOrderStatus.Diagnosis,
        WorkOrderStatus.Delivered,
      ),
    ).toBe(false);
    expect(
      canTransitionWorkOrder(
        WorkOrderStatus.Diagnosis,
        WorkOrderStatus.InRepair,
      ),
    ).toBe(true);
  });
});

describe("regression: inventory and RBAC canonical cases", () => {
  it("keeps 7 critical SKUs and brake pads with stock 2", async () => {
    const critical = await inventoryService.listCritical();
    const brakePads = await inventoryService.getStock(
      BRAKE_PADS,
      BRANCH_LA_MOLINA,
    );

    expect(critical).toHaveLength(7);
    expect(brakePads[0]?.quantity).toBe(2);
    expect(brakePads[0]?.minStock).toBe(8);
  });

  it("grants settings.manage only to Carlos (admin)", () => {
    expect(can(userById("USR-0001"), "settings.manage", roleSeed)).toBe(true);
    expect(can(userById("USR-0002"), "settings.manage", roleSeed)).toBe(false);
  });
});

describe("regression: POS pay canonical case", () => {
  it("charges the draft oil ticket and reduces stock", async () => {
    const pos = createPosService();
    const ticket = await pos.createTicket({ branchId: BRANCH_LA_MOLINA });
    const withLine = await pos.addLine(ticket.id, {
      kind: PosLineKind.Product,
      productId: OIL_5W30,
      description: "Aceite 5W30 Mobil",
      quantity: 6,
      unitPrice: money(8000),
    });

    const paid = await pos.pay(withLine.id, [
      { method: PaymentMethod.Cash, amount: withLine.totals.total },
    ]);
    expect(paid.status).toBe(PosStatus.Paid);

    const stock = await inventoryService.getStock(OIL_5W30, BRANCH_LA_MOLINA);
    expect(stock[0]?.quantity).toBe(18);
  });
});
