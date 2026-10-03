import type { DamageMark } from "@/domain/inspections/diagram";
import type { DamageZoneId } from "@/domain/inspections/zones";
import type { DateTimeIso, EntityId } from "@/domain/shared";

export enum DamageSeverity {
  Minor = "minor",
  Moderate = "moderate",
  Severe = "severe",
}

export const DAMAGE_SEVERITY_LABELS: Record<DamageSeverity, string> = {
  [DamageSeverity.Minor]: "Leve",
  [DamageSeverity.Moderate]: "Moderado",
  [DamageSeverity.Severe]: "Grave",
};

export enum InspectionStatus {
  Pending = "pending",
  InProgress = "in_progress",
  Completed = "completed",
}

export type DamagePoint = {
  readonly id: EntityId;
  readonly zoneId: DamageZoneId;
  readonly severity: DamageSeverity;
  readonly notes?: string | undefined;
  readonly photos: readonly string[];
};

export const INSPECTION_CHECKLIST_CATALOG = [
  { id: "luces", label: "Luces y direccionales" },
  { id: "llantas", label: "Estado de llantas" },
  { id: "frenos", label: "Sistema de frenos" },
  { id: "aceite", label: "Nivel de aceite" },
  { id: "refrigerante", label: "Refrigerante" },
  { id: "limpieza", label: "Limpieza interior" },
] as const;

export type InspectionChecklistItemId =
  (typeof INSPECTION_CHECKLIST_CATALOG)[number]["id"];

export type InspectionChecklistItem = {
  readonly id: InspectionChecklistItemId;
  readonly label: string;
  readonly checked: boolean;
  readonly notes?: string | undefined;
};

export type Inspection = {
  readonly id: EntityId;
  readonly receptionId: EntityId;
  readonly vehicleId: EntityId;
  readonly status: InspectionStatus;
  readonly damagePoints: readonly DamagePoint[];
  /** Marcas libres dibujadas sobre el diagrama en planta. */
  readonly damageMarks?: readonly DamageMark[] | undefined;
  readonly checklist: readonly InspectionChecklistItem[];
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export function createInspectionChecklist(
  checked: readonly InspectionChecklistItemId[] = [],
): InspectionChecklistItem[] {
  return INSPECTION_CHECKLIST_CATALOG.map((item) => ({
    id: item.id,
    label: item.label,
    checked: checked.includes(item.id),
  }));
}
