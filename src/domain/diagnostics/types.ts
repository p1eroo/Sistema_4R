import type { DateTimeIso, EntityId } from "@/domain/shared";

export enum DiagnosticStatus {
  Draft = "draft",
  Completed = "completed",
  Reviewed = "reviewed",
}

export const DIAGNOSTIC_STATUS_LABELS: Record<DiagnosticStatus, string> = {
  [DiagnosticStatus.Draft]: "Borrador",
  [DiagnosticStatus.Completed]: "Completado",
  [DiagnosticStatus.Reviewed]: "Revisado",
};

export enum DiagnosticSeverity {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export const DIAGNOSTIC_SEVERITY_LABELS: Record<DiagnosticSeverity, string> = {
  [DiagnosticSeverity.Low]: "Leve",
  [DiagnosticSeverity.Medium]: "Moderado",
  [DiagnosticSeverity.High]: "Grave",
};

export type DiagnosticFinding = {
  readonly id: EntityId;
  readonly code?: string | undefined;
  readonly title: string;
  readonly description?: string | undefined;
  readonly severity: DiagnosticSeverity;
  readonly recommendation?: string | undefined;
};

export type Diagnostic = {
  readonly id: EntityId;
  readonly workOrderId: EntityId;
  readonly technicianId?: EntityId | undefined;
  readonly status: DiagnosticStatus;
  readonly summary: string;
  readonly findings: readonly DiagnosticFinding[];
  readonly recommendation?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type DiagnosticListItem = {
  readonly id: EntityId;
  readonly workOrderId: EntityId;
  readonly status: DiagnosticStatus;
  readonly summary: string;
  readonly findingsCount: number;
  readonly updatedAt: DateTimeIso;
};
