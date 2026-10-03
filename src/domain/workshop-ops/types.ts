import type { DateTimeIso, EntityId } from "@/domain/shared";
import type { WorkOrderStatus } from "@/domain/work-orders/status";

export const WORKSHOP_BAY_CAPACITY = 24;

export enum BayStatus {
  Free = "free",
  Occupied = "occupied",
  Blocked = "blocked",
}

export const BAY_STATUS_LABELS: Record<BayStatus, string> = {
  [BayStatus.Free]: "Libre",
  [BayStatus.Occupied]: "Ocupada",
  [BayStatus.Blocked]: "Bloqueada",
};

export type WorkshopBay = {
  readonly id: EntityId;
  readonly code: string;
  readonly name: string;
  readonly branchId: EntityId;
  readonly status: BayStatus;
  readonly currentWorkOrderId?: EntityId | undefined;
  readonly notes?: string | undefined;
  readonly updatedAt: DateTimeIso;
};

export type BayAssignment = {
  readonly id: EntityId;
  readonly bayId: EntityId;
  readonly workOrderId: EntityId;
  readonly status: WorkOrderStatus;
  readonly assignedAt: DateTimeIso;
  readonly releasedAt?: DateTimeIso | undefined;
};

export enum QualityResult {
  Pass = "pass",
  Fail = "fail",
}

export const QUALITY_RESULT_LABELS: Record<QualityResult, string> = {
  [QualityResult.Pass]: "Aprobado",
  [QualityResult.Fail]: "Rechazado",
};

export const QUALITY_CHECK_CATALOG = [
  { id: "prueba_ruta", label: "Prueba de ruta" },
  { id: "frenos", label: "Prueba de frenos" },
  { id: "luces", label: "Luces y accesorios" },
  { id: "niveles", label: "Niveles y fugas" },
  { id: "limpieza", label: "Limpieza y presentación" },
] as const;

export type QualityCheckItemId = (typeof QUALITY_CHECK_CATALOG)[number]["id"];

export type QualityCheckItem = {
  readonly id: QualityCheckItemId;
  readonly label: string;
  readonly passed: boolean;
  readonly notes?: string | undefined;
};

export type QualityCheck = {
  readonly id: EntityId;
  readonly workOrderId: EntityId;
  readonly result: QualityResult;
  readonly items: readonly QualityCheckItem[];
  readonly failureReasons: readonly string[];
  readonly checkedBy?: EntityId | undefined;
  readonly checkedAt: DateTimeIso;
  readonly notes?: string | undefined;
};

export enum DeliveryStatus {
  Scheduled = "scheduled",
  Ready = "ready",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  [DeliveryStatus.Scheduled]: "Programada",
  [DeliveryStatus.Ready]: "Lista para entrega",
  [DeliveryStatus.Delivered]: "Entregada",
  [DeliveryStatus.Cancelled]: "Cancelada",
};

export const DELIVERY_CHECKLIST_CATALOG = [
  { id: "documentos", label: "Documentos y factura" },
  { id: "llaves", label: "Juego de llaves" },
  { id: "accesorios", label: "Accesorios y pertenencias" },
  { id: "pago", label: "Pago confirmado" },
  { id: "conformidad", label: "Conformidad del cliente" },
] as const;

export type DeliveryChecklistItemId =
  (typeof DELIVERY_CHECKLIST_CATALOG)[number]["id"];

export type DeliveryChecklistItem = {
  readonly id: DeliveryChecklistItemId;
  readonly label: string;
  readonly checked: boolean;
  readonly notes?: string | undefined;
};

export type Delivery = {
  readonly id: EntityId;
  readonly workOrderId: EntityId;
  readonly customerId: EntityId;
  readonly vehicleId: EntityId;
  readonly branchId: EntityId;
  readonly status: DeliveryStatus;
  readonly scheduledAt?: DateTimeIso | undefined;
  readonly deliveredAt?: DateTimeIso | undefined;
  readonly mileageKm?: number | undefined;
  readonly receivedBy?: string | undefined;
  readonly checklist: readonly DeliveryChecklistItem[];
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export function createQualityChecklist(
  passed: readonly QualityCheckItemId[] = [],
): QualityCheckItem[] {
  return QUALITY_CHECK_CATALOG.map((item) => ({
    id: item.id,
    label: item.label,
    passed: passed.includes(item.id),
  }));
}

export function createDeliveryChecklist(
  checked: readonly DeliveryChecklistItemId[] = [],
): DeliveryChecklistItem[] {
  return DELIVERY_CHECKLIST_CATALOG.map((item) => ({
    id: item.id,
    label: item.label,
    checked: checked.includes(item.id),
  }));
}
