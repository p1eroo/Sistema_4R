import type { DateTimeIso, EntityId } from "@/domain/shared";
import type { WorkOrderStatus } from "@/domain/work-orders/status";

export enum WorkOrderPriority {
  Low = "low",
  Normal = "normal",
  High = "high",
  Urgent = "urgent",
}

export const WORK_ORDER_PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  [WorkOrderPriority.Low]: "Baja",
  [WorkOrderPriority.Normal]: "Normal",
  [WorkOrderPriority.High]: "Alta",
  [WorkOrderPriority.Urgent]: "Urgente",
};

export type WorkOrder = {
  readonly id: EntityId;
  readonly code: string;
  readonly customerId: EntityId;
  readonly vehicleId: EntityId;
  readonly branchId: EntityId;
  readonly advisorId?: EntityId | undefined;
  readonly technicianId?: EntityId | undefined;
  readonly receptionId?: EntityId | undefined;
  readonly estimateId?: EntityId | undefined;
  readonly bayId?: EntityId | undefined;
  readonly status: WorkOrderStatus;
  readonly priority: WorkOrderPriority;
  readonly reason: string;
  readonly odometerKm: number;
  readonly openedAt: DateTimeIso;
  readonly promisedAt?: DateTimeIso | undefined;
  readonly closedAt?: DateTimeIso | undefined;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type WorkOrderListItem = {
  readonly id: EntityId;
  readonly code: string;
  readonly status: WorkOrderStatus;
  readonly priority: WorkOrderPriority;
  readonly customerName: string;
  readonly plate: string;
  readonly vehicleLabel: string;
  readonly technicianName?: string | undefined;
  readonly promisedAt?: DateTimeIso | undefined;
};

export function buildWorkOrderCode(year: number, sequence: number): string {
  return `OT-${year}-${String(sequence).padStart(4, "0")}`;
}
