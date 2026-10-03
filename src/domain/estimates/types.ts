import type { DateTimeIso, EntityId, Money } from "@/domain/shared";

export enum EstimateStatus {
  Draft = "draft",
  PendingApproval = "pending_approval",
  Approved = "approved",
  Rejected = "rejected",
  Expired = "expired",
}

export const ESTIMATE_STATUS_LABELS: Record<EstimateStatus, string> = {
  [EstimateStatus.Draft]: "Borrador",
  [EstimateStatus.PendingApproval]: "Pendiente de aprobación",
  [EstimateStatus.Approved]: "Aprobado",
  [EstimateStatus.Rejected]: "Rechazado",
  [EstimateStatus.Expired]: "Vencido",
};

export enum EstimateLineKind {
  Labor = "labor",
  Part = "part",
  Other = "other",
}

export const ESTIMATE_LINE_KIND_LABELS: Record<EstimateLineKind, string> = {
  [EstimateLineKind.Labor]: "Mano de obra",
  [EstimateLineKind.Part]: "Repuesto",
  [EstimateLineKind.Other]: "Otro",
};

export type EstimateLine = {
  readonly id: EntityId;
  readonly kind: EstimateLineKind;
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly discount?: Money | undefined;
  readonly productId?: EntityId | undefined;
  readonly notes?: string | undefined;
};

export type Estimate = {
  readonly id: EntityId;
  readonly code: string;
  readonly workOrderId?: EntityId | undefined;
  readonly customerId: EntityId;
  readonly vehicleId: EntityId;
  readonly status: EstimateStatus;
  readonly lines: readonly EstimateLine[];
  readonly globalDiscount: Money;
  readonly igvRate: number;
  readonly subtotal: Money;
  readonly discount: Money;
  readonly igv: Money;
  readonly total: Money;
  readonly validUntil?: DateTimeIso | undefined;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export function buildEstimateCode(year: number, sequence: number): string {
  return `EST-${year}-${String(sequence).padStart(4, "0")}`;
}
