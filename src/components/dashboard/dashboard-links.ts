import type { DashboardActivity } from "@/domain/dashboard/types";

export const dashboardPaths = {
  wip: "/taller/wip",
  orders: "/taller/ordenes",
  appointments: "/taller/citas",
  deliveries: "/taller/entregas",
  criticalInventory: "/inventario/critico",
  inventory: "/inventario",
  reports: "/reportes",
  pos: "/pos",
} as const;

export function workOrderHref(workOrderId: string): string {
  return `/taller/ordenes/${workOrderId}`;
}

export function resolveActivityHref(
  activity: DashboardActivity,
): string | undefined {
  const entityId = activity.id.replace(/^activity-/, "");
  if (entityId.startsWith("TK-")) {
    return dashboardPaths.pos;
  }
  if (entityId.startsWith("WO-")) {
    return workOrderHref(entityId);
  }
  return dashboardPaths.reports;
}

export function readyVehicleHref(workOrderId: string): string {
  return workOrderHref(workOrderId);
}
