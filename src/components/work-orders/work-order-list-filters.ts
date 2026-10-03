import { CUSTOMER_BRANCHES } from "@/components/customers/customer-list-filters";
import type { EntityId } from "@/domain/shared";
import { WorkOrderStatus } from "@/domain/work-orders/status";

export type WorkOrderListRow = {
  readonly id: EntityId;
  readonly code: string;
  readonly status: WorkOrderStatus;
  readonly customerName: string;
  readonly plate: string;
  readonly vehicleLabel: string;
  readonly branchId: EntityId;
  readonly reason: string;
};

export type WorkOrderListFilters = {
  readonly search: string;
  readonly status: string;
  readonly branchId: string;
};

export const EMPTY_WORK_ORDER_FILTERS: WorkOrderListFilters = {
  search: "",
  status: "all",
  branchId: "all",
};

export const WORK_ORDER_STATUS_CHIPS = [
  { id: "all", label: "Todas" },
  { id: WorkOrderStatus.Diagnosis, label: "Diagnóstico" },
  { id: WorkOrderStatus.InRepair, label: "En reparación" },
  { id: WorkOrderStatus.Quality, label: "Control" },
  { id: WorkOrderStatus.Ready, label: "Listo" },
] as const;

export function workOrderBranchName(branchId: EntityId): string {
  return (
    CUSTOMER_BRANCHES.find((branch) => branch.id === branchId)?.name ?? branchId
  );
}

export function workOrderStatusVariant(
  status: WorkOrderStatus,
): "info" | "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case WorkOrderStatus.Diagnosis:
      return "info";
    case WorkOrderStatus.InRepair:
      return "warning";
    case WorkOrderStatus.Quality:
      return "info";
    case WorkOrderStatus.Ready:
      return "success";
    case WorkOrderStatus.Delivered:
      return "neutral";
    case WorkOrderStatus.Cancelled:
      return "danger";
  }
}

export function filterWorkOrders(
  items: readonly WorkOrderListRow[],
  filters: WorkOrderListFilters,
): WorkOrderListRow[] {
  const needle = filters.search.trim().toLowerCase();

  return items.filter((order) => {
    if (filters.status !== "all" && order.status !== filters.status) {
      return false;
    }

    if (filters.branchId !== "all" && order.branchId !== filters.branchId) {
      return false;
    }

    if (!needle) {
      return true;
    }

    return (
      order.code.toLowerCase().includes(needle) ||
      order.plate.toLowerCase().includes(needle) ||
      order.customerName.toLowerCase().includes(needle) ||
      order.vehicleLabel.toLowerCase().includes(needle)
    );
  });
}
