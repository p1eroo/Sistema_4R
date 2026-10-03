import { describe, expect, it } from "vitest";

import { asEntityId } from "@/domain/shared";
import { WorkOrderStatus } from "@/domain/work-orders";
import {
  BayStatus,
  QualityResult,
  createQualityChecklist,
  type QualityCheckItem,
} from "@/domain/workshop-ops";
import {
  BayValidationError,
  createBaysService,
  createWipService,
} from "@/mocks/workshop-ops/bays-service";
import { deliveryService as defaultDelivery } from "@/mocks/workshop-ops/delivery-service";
import { qualityService as defaultQuality } from "@/mocks/workshop-ops/quality-service";

describe("baysService", () => {
  it("seeds 24 bays with two occupied", async () => {
    const bays = createBaysService();
    const all = await bays.list({ pageSize: 100 });
    const occupied = all.items.filter(
      (bay) => bay.status === BayStatus.Occupied,
    );

    expect(all.pagination.total).toBe(24);
    expect(occupied).toHaveLength(2);
  });

  it("assigns and releases a bay", async () => {
    const bays = createBaysService();
    const assigned = await bays.assign(
      asEntityId("BAY-0003"),
      asEntityId("WO-2026-0201"),
    );

    expect(assigned.status).toBe(BayStatus.Occupied);
    expect(assigned.currentWorkOrderId).toBe("WO-2026-0201");

    await expect(
      bays.assign(asEntityId("BAY-0003"), asEntityId("WO-2026-0202")),
    ).rejects.toBeInstanceOf(BayValidationError);

    const released = await bays.release(asEntityId("BAY-0003"));
    expect(released.status).toBe(BayStatus.Free);
    expect(released.currentWorkOrderId).toBeUndefined();
  });
});

describe("wipService", () => {
  it("groups orders by status and delegates status moves", async () => {
    const wip = createWipService(createBaysService());
    const board = await wip.getBoard();

    expect(board[WorkOrderStatus.Diagnosis]).toHaveLength(7);
    expect(board[WorkOrderStatus.Ready]).toHaveLength(6);

    const moved = await wip.moveStatus(
      asEntityId("WO-2026-0182"),
      WorkOrderStatus.InRepair,
    );
    expect(moved.status).toBe(WorkOrderStatus.InRepair);
  });
});

describe("qualityService", () => {
  it("has the pending check for OT-2026-0184", async () => {
    const quality = defaultQuality;
    const check = await quality.getByWorkOrder(asEntityId("WO-2026-0184"));

    expect(check?.id).toBe("QC-0001");
  });

  it("sends a passed order to ready and a failed one back to repair", async () => {
    const quality = defaultQuality;
    const passed: QualityCheckItem[] = createQualityChecklist([]).map(
      (item) => ({ ...item, passed: true }),
    );

    const ok = await quality.record(asEntityId("WO-2026-0197"), passed);
    expect(ok.check.result).toBe(QualityResult.Pass);
    expect(ok.workOrder.status).toBe(WorkOrderStatus.Ready);

    const failed = passed.map((item, index) =>
      index === 0 ? { ...item, passed: false, notes: "Fuga detectada" } : item,
    );
    const bad = await quality.record(asEntityId("WO-2026-0198"), failed);
    expect(bad.check.result).toBe(QualityResult.Fail);
    expect(bad.check.failureReasons[0]).toBe("Fuga detectada");
    expect(bad.workOrder.status).toBe(WorkOrderStatus.InRepair);
  });
});

describe("deliveryService", () => {
  it("lists the three deliveries of today", async () => {
    const today = await defaultDelivery.listToday();

    expect(today.pagination.total).toBe(3);
    expect(today.items.map((delivery) => delivery.vehicleId)).toEqual(
      expect.arrayContaining(["VEH-0001", "VEH-0002", "VEH-0003"]),
    );
  });

  it("marks a scheduled delivery as delivered and closes the work order", async () => {
    const delivery = await defaultDelivery.schedule({
      workOrderId: asEntityId("WO-2026-0211"),
      customerId: asEntityId("CUS-0001"),
      vehicleId: asEntityId("VEH-0001"),
      branchId: asEntityId("BR-LM"),
    });

    const delivered = await defaultDelivery.markDelivered(delivery.id, {
      receivedBy: "Lucía Ramos",
      mileageKm: 48500,
    });

    expect(delivered.status).toBe("delivered");
    expect(delivered.deliveredAt).toBeTruthy();
    expect(delivered.receivedBy).toBe("Lucía Ramos");
  });
});
