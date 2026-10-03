import { describe, expect, it } from "vitest";

import { WorkOrderStatus } from "@/domain/work-orders/status";
import { createDashboardService } from "@/mocks/dashboard/service";

describe("dashboardService.getDashboardSnapshot", () => {
  it("mirrors the work order slices from O-024", async () => {
    const snapshot = await createDashboardService().getDashboardSnapshot();
    const byStatus = new Map(
      snapshot.workOrderSlices.map((slice) => [slice.status, slice.value]),
    );

    expect(byStatus.get(WorkOrderStatus.Diagnosis)).toBe(7);
    expect(byStatus.get(WorkOrderStatus.InRepair)).toBe(12);
    expect(byStatus.get(WorkOrderStatus.Quality)).toBe(4);
    expect(byStatus.get(WorkOrderStatus.Ready)).toBe(6);
  });

  it("reports critical stock and gaps", async () => {
    const snapshot = await createDashboardService().getDashboardSnapshot();

    expect(snapshot.lowStock).toHaveLength(7);

    const stockMetric = snapshot.metrics.find(
      (metric) => metric.id === "stockCritical",
    );
    expect(stockMetric?.value).toBe("7");
    expect(stockMetric?.detail).toBe("2 sin reposición");

    expect(snapshot.financeSeries).toHaveLength(0);
    expect(snapshot.gaps.length).toBeGreaterThan(0);
  });

  it("lists today's appointments and ready vehicles", async () => {
    const snapshot = await createDashboardService().getDashboardSnapshot();

    expect(snapshot.todayAppointments).toHaveLength(3);
    expect(snapshot.readyVehicles).toHaveLength(6);
    expect(snapshot.pendingOrders.length).toBeGreaterThan(0);
  });
});
