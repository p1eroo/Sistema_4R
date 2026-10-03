import { describe, expect, it } from "vitest";

import { WorkOrderStatus } from "@/domain/work-orders";
import {
  assertWorkOrderTransition,
  canTransitionWorkOrder,
  WorkOrderTransitionError,
} from "@/domain/work-orders/transitions";

describe("canTransitionWorkOrder", () => {
  it("allows the linear flow", () => {
    expect(
      canTransitionWorkOrder(
        WorkOrderStatus.Diagnosis,
        WorkOrderStatus.InRepair,
      ),
    ).toBe(true);
    expect(
      canTransitionWorkOrder(WorkOrderStatus.InRepair, WorkOrderStatus.Quality),
    ).toBe(true);
    expect(
      canTransitionWorkOrder(WorkOrderStatus.Quality, WorkOrderStatus.Ready),
    ).toBe(true);
    expect(
      canTransitionWorkOrder(WorkOrderStatus.Ready, WorkOrderStatus.Delivered),
    ).toBe(true);
  });

  it("does not allow skipping from diagnosis to delivered", () => {
    expect(
      canTransitionWorkOrder(
        WorkOrderStatus.Diagnosis,
        WorkOrderStatus.Delivered,
      ),
    ).toBe(false);
  });

  it("does not allow leaving delivered or cancelled", () => {
    expect(
      canTransitionWorkOrder(WorkOrderStatus.Delivered, WorkOrderStatus.Ready),
    ).toBe(false);
    expect(
      canTransitionWorkOrder(
        WorkOrderStatus.Cancelled,
        WorkOrderStatus.InRepair,
      ),
    ).toBe(false);
  });
});

describe("assertWorkOrderTransition", () => {
  it("throws a typed error with a Spanish message", () => {
    expect(() =>
      assertWorkOrderTransition(
        WorkOrderStatus.Diagnosis,
        WorkOrderStatus.Delivered,
      ),
    ).toThrow(WorkOrderTransitionError);

    expect(() =>
      assertWorkOrderTransition(
        WorkOrderStatus.Diagnosis,
        WorkOrderStatus.Delivered,
      ),
    ).toThrow(/Diagnóstico.*Entregado/);
  });

  it("returns nothing for a valid transition", () => {
    expect(() =>
      assertWorkOrderTransition(
        WorkOrderStatus.Diagnosis,
        WorkOrderStatus.InRepair,
      ),
    ).not.toThrow();
  });
});
