export enum WorkOrderStatus {
  Diagnosis = "diagnosis",
  InRepair = "in_repair",
  Quality = "quality",
  Ready = "ready",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.Diagnosis]: "Diagnóstico",
  [WorkOrderStatus.InRepair]: "En reparación",
  [WorkOrderStatus.Quality]: "Control",
  [WorkOrderStatus.Ready]: "Listo",
  [WorkOrderStatus.Delivered]: "Entregado",
  [WorkOrderStatus.Cancelled]: "Cancelada",
};

export const WORK_ORDER_ACTIVE_STATUSES: readonly WorkOrderStatus[] = [
  WorkOrderStatus.Diagnosis,
  WorkOrderStatus.InRepair,
  WorkOrderStatus.Quality,
  WorkOrderStatus.Ready,
];

export function isWorkOrderOpen(status: WorkOrderStatus): boolean {
  return WORK_ORDER_ACTIVE_STATUSES.includes(status);
}
