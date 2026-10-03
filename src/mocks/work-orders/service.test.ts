import { beforeEach, describe, expect, it } from "vitest";

import { asEntityId } from "@/domain/shared";
import { WorkOrderPriority } from "@/domain/work-orders";
import { WorkOrderStatus } from "@/domain/work-orders/status";
import { WorkOrderTransitionError } from "@/domain/work-orders/transitions";
import {
  WorkOrderNotFoundError,
  WorkOrderValidationError,
  createWorkOrderService,
  type WorkOrderService,
} from "@/mocks/work-orders/service";

let service: WorkOrderService;

beforeEach(() => {
  service = createWorkOrderService();
});

describe("workOrderService seed and reads", () => {
  it("matches the dashboard pie counts", async () => {
    const counts = await service.countByStatus();

    expect(counts[WorkOrderStatus.Diagnosis]).toBe(7);
    expect(counts[WorkOrderStatus.InRepair]).toBe(12);
    expect(counts[WorkOrderStatus.Quality]).toBe(4);
    expect(counts[WorkOrderStatus.Ready]).toBe(6);
  });

  it("lists all seeded orders", async () => {
    const result = await service.list({ pageSize: 100 });

    expect(result.items).toHaveLength(29);
    expect(result.pagination.total).toBe(29);
  });

  it("includes OT-2026-0184 in quality for the dashboard vehicle", async () => {
    const order = await service.getById(asEntityId("WO-2026-0184"));

    expect(order?.code).toBe("OT-2026-0184");
    expect(order?.status).toBe(WorkOrderStatus.Quality);
    expect(order?.vehicleId).toBe("VEH-0001");
  });

  it("filters by status", async () => {
    const result = await service.listByStatus(WorkOrderStatus.Ready);

    expect(result.items).toHaveLength(6);
    expect(
      result.items.every((order) => order.status === WorkOrderStatus.Ready),
    ).toBe(true);
  });
});

describe("workOrderService.createFromReception", () => {
  it("creates a diagnosis order from a completed reception", async () => {
    const order = await service.createFromReception(asEntityId("RCP-0001"));

    expect(order.status).toBe(WorkOrderStatus.Diagnosis);
    expect(order.receptionId).toBe("RCP-0001");
    expect(order.vehicleId).toBe("VEH-0001");
    expect(order.code).toMatch(/^OT-\d{4}-\d{4}$/);
    expect(order.id).toBeTruthy();
  });

  it("fails when the reception is not completed", async () => {
    await expect(
      service.createFromReception(asEntityId("RCP-0003")),
    ).rejects.toBeInstanceOf(WorkOrderValidationError);
  });

  it("fails when the reception does not exist", async () => {
    await expect(
      service.createFromReception(asEntityId("RCP-9999")),
    ).rejects.toBeInstanceOf(WorkOrderValidationError);
  });
});

describe("workOrderService.updateStatus", () => {
  it("allows a valid transition", async () => {
    const updated = await service.updateStatus(
      asEntityId("WO-2026-0182"),
      WorkOrderStatus.InRepair,
    );

    expect(updated.status).toBe(WorkOrderStatus.InRepair);
  });

  it("rejects an illegal transition", async () => {
    await expect(
      service.updateStatus(
        asEntityId("WO-2026-0182"),
        WorkOrderStatus.Delivered,
      ),
    ).rejects.toBeInstanceOf(WorkOrderTransitionError);
  });

  it("rejects unknown ids", async () => {
    await expect(
      service.updateStatus(asEntityId("WO-9999"), WorkOrderStatus.InRepair),
    ).rejects.toBeInstanceOf(WorkOrderNotFoundError);
  });
});

describe("workOrderService.update", () => {
  it("updates editable fields", async () => {
    const updated = await service.update(asEntityId("WO-2026-0182"), {
      priority: WorkOrderPriority.Urgent,
      notes: "Cliente espera el auto hoy.",
    });

    expect(updated.priority).toBe(WorkOrderPriority.Urgent);
    expect(updated.notes).toBe("Cliente espera el auto hoy.");
  });
});
