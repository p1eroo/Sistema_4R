import type { EntityId } from "@/domain/shared";
import type { WorkOrderStatus } from "@/domain/work-orders/status";

export type DashboardRange = "today" | "week" | "month";

export type DashboardFilters = {
  readonly branchId?: EntityId | "all";
  readonly range?: DashboardRange;
  readonly from?: string;
  readonly to?: string;
};

export type DashboardMetricTone = "default" | "warning" | "danger";

export type DashboardMetric = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly tone?: DashboardMetricTone | undefined;
};

export type DashboardWorkOrderSlice = {
  readonly status: WorkOrderStatus;
  readonly name: string;
  readonly value: number;
};

export type DashboardSalesPoint = {
  readonly day: string;
  readonly sales: number;
};

export type DashboardFinancePoint = {
  readonly month: string;
  readonly income: number;
  readonly expenses: number;
};

export type DashboardRankingItem = {
  readonly name: string;
  readonly value: number;
};

export type DashboardActivityTone =
  "success" | "info" | "neutral" | "warning" | "danger";

export type DashboardActivity = {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
  readonly time: string;
  readonly tone: DashboardActivityTone;
};

export type DashboardReadyVehicle = {
  readonly workOrderId: EntityId;
  readonly code: string;
  readonly plate: string;
  readonly vehicleLabel: string;
  readonly promisedAt?: string | undefined;
};

export type DashboardLowStockItem = {
  readonly productId: EntityId;
  readonly name: string;
  readonly stock: number;
  readonly minStock: number;
  readonly unit: string;
  readonly restockable: boolean;
};

export type DashboardAppointmentItem = {
  readonly id: EntityId;
  readonly time: string;
  readonly customerName: string;
  readonly vehicleLabel: string;
};

export type DashboardPendingOrderItem = {
  readonly workOrderId: EntityId;
  readonly code: string;
  readonly label: string;
};

export type DashboardSnapshot = {
  readonly filters: DashboardFilters;
  readonly metrics: readonly DashboardMetric[];
  readonly workOrderSlices: readonly DashboardWorkOrderSlice[];
  readonly salesSeries: readonly DashboardSalesPoint[];
  readonly financeSeries: readonly DashboardFinancePoint[];
  readonly serviceRanking: readonly DashboardRankingItem[];
  readonly productRanking: readonly DashboardRankingItem[];
  readonly activities: readonly DashboardActivity[];
  readonly readyVehicles: readonly DashboardReadyVehicle[];
  readonly lowStock: readonly DashboardLowStockItem[];
  readonly todayAppointments: readonly DashboardAppointmentItem[];
  readonly pendingOrders: readonly DashboardPendingOrderItem[];
  readonly gaps: readonly string[];
};
