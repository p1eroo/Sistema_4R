import type { DateTimeIso, EntityId } from "@/domain/shared";

export enum ReceptionStatus {
  Draft = "draft",
  InProgress = "in_progress",
  Completed = "completed",
  Cancelled = "cancelled",
}

export enum FuelLevel {
  Empty = "empty",
  Quarter = "quarter",
  Half = "half",
  ThreeQuarters = "three_quarters",
  Full = "full",
}

export const RECEPTION_CHECKLIST_CATALOG = [
  { id: "documentos", label: "Documentos del vehículo" },
  { id: "llanta_repuesto", label: "Llanta de repuesto" },
  { id: "gata_herramientas", label: "Gata y herramientas" },
  { id: "triangulos", label: "Triángulos de seguridad" },
  { id: "extintor", label: "Extintor" },
  { id: "radio", label: "Radio / pantalla" },
  { id: "tapetes", label: "Tapetes" },
] as const;

export type ChecklistItemId =
  (typeof RECEPTION_CHECKLIST_CATALOG)[number]["id"];

export type ChecklistItem = {
  readonly id: ChecklistItemId;
  readonly label: string;
  readonly checked: boolean;
  readonly notes?: string | undefined;
};

export type Belonging = {
  readonly id: EntityId;
  readonly label: string;
  readonly quantity: number;
  readonly notes?: string | undefined;
};

export type Reception = {
  readonly id: EntityId;
  readonly code: string;
  readonly customerId: EntityId;
  readonly vehicleId: EntityId;
  readonly branchId: EntityId;
  readonly advisorId?: EntityId | undefined;
  readonly status: ReceptionStatus;
  readonly reason: string;
  readonly odometerKm: number;
  readonly fuelLevel: FuelLevel;
  readonly belongings: readonly Belonging[];
  readonly checklist: readonly ChecklistItem[];
  readonly observations?: string | undefined;
  readonly receivedAt?: DateTimeIso | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export function createReceptionChecklist(
  checked: readonly ChecklistItemId[] = [],
): ChecklistItem[] {
  return RECEPTION_CHECKLIST_CATALOG.map((item) => ({
    id: item.id,
    label: item.label,
    checked: checked.includes(item.id),
  }));
}

export function isReceptionEditable(status: ReceptionStatus): boolean {
  return (
    status === ReceptionStatus.Draft || status === ReceptionStatus.InProgress
  );
}
