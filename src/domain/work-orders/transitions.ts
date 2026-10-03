import {
  WorkOrderStatus,
  WORK_ORDER_STATUS_LABELS,
} from "@/domain/work-orders/status";

export const WORK_ORDER_TRANSITIONS: Record<
  WorkOrderStatus,
  readonly WorkOrderStatus[]
> = {
  [WorkOrderStatus.Diagnosis]: [
    WorkOrderStatus.InRepair,
    WorkOrderStatus.Cancelled,
  ],
  [WorkOrderStatus.InRepair]: [
    WorkOrderStatus.Quality,
    WorkOrderStatus.Cancelled,
  ],
  [WorkOrderStatus.Quality]: [
    WorkOrderStatus.Ready,
    WorkOrderStatus.InRepair,
    WorkOrderStatus.Cancelled,
  ],
  [WorkOrderStatus.Ready]: [
    WorkOrderStatus.Delivered,
    WorkOrderStatus.InRepair,
    WorkOrderStatus.Cancelled,
  ],
  [WorkOrderStatus.Delivered]: [],
  [WorkOrderStatus.Cancelled]: [],
};

export class WorkOrderTransitionError extends Error {
  readonly from: WorkOrderStatus;
  readonly to: WorkOrderStatus;

  constructor(from: WorkOrderStatus, to: WorkOrderStatus) {
    super(
      `No se puede pasar de ${WORK_ORDER_STATUS_LABELS[from]} a ${WORK_ORDER_STATUS_LABELS[to]}.`,
    );
    this.name = "WorkOrderTransitionError";
    this.from = from;
    this.to = to;
  }
}

export function canTransitionWorkOrder(
  from: WorkOrderStatus,
  to: WorkOrderStatus,
): boolean {
  return WORK_ORDER_TRANSITIONS[from].includes(to);
}

export function assertWorkOrderTransition(
  from: WorkOrderStatus,
  to: WorkOrderStatus,
): void {
  if (!canTransitionWorkOrder(from, to)) {
    throw new WorkOrderTransitionError(from, to);
  }
}
