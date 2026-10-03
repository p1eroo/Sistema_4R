import { describe, expect, it } from "vitest";

import {
  buildWorkOrderCode,
  isWorkOrderOpen,
  WORK_ORDER_STATUS_LABELS,
  WorkOrderStatus,
} from "@/domain/work-orders";

describe("work order status", () => {
  it("covers the dashboard pie statuses", () => {
    expect(WORK_ORDER_STATUS_LABELS[WorkOrderStatus.Diagnosis]).toBe(
      "Diagnóstico",
    );
    expect(WORK_ORDER_STATUS_LABELS[WorkOrderStatus.InRepair]).toBe(
      "En reparación",
    );
    expect(WORK_ORDER_STATUS_LABELS[WorkOrderStatus.Quality]).toBe("Control");
    expect(WORK_ORDER_STATUS_LABELS[WorkOrderStatus.Ready]).toBe("Listo");
  });

  it("treats delivered and cancelled as closed", () => {
    expect(isWorkOrderOpen(WorkOrderStatus.Diagnosis)).toBe(true);
    expect(isWorkOrderOpen(WorkOrderStatus.Ready)).toBe(true);
    expect(isWorkOrderOpen(WorkOrderStatus.Delivered)).toBe(false);
    expect(isWorkOrderOpen(WorkOrderStatus.Cancelled)).toBe(false);
  });
});

describe("buildWorkOrderCode", () => {
  it("builds the canonical dashboard code", () => {
    expect(buildWorkOrderCode(2026, 184)).toBe("OT-2026-0184");
  });
});
