import type { DateTimeIso, EntityId } from "@/domain/shared";

export const LIMA_TIME_ZONE = "America/Lima";
export const LIMA_UTC_OFFSET = "-05:00";

export enum AppointmentStatus {
  Scheduled = "scheduled",
  Confirmed = "confirmed",
  InProgress = "in_progress",
  Completed = "completed",
  Cancelled = "cancelled",
  NoShow = "no_show",
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.Scheduled]: "Programada",
  [AppointmentStatus.Confirmed]: "Confirmada",
  [AppointmentStatus.InProgress]: "En atención",
  [AppointmentStatus.Completed]: "Atendida",
  [AppointmentStatus.Cancelled]: "Cancelada",
  [AppointmentStatus.NoShow]: "No asistió",
};

export enum AppointmentServiceType {
  Maintenance = "maintenance",
  Repair = "repair",
  Diagnosis = "diagnosis",
  Inspection = "inspection",
  Cosmetic = "cosmetic",
}

export const APPOINTMENT_SERVICE_LABELS: Record<
  AppointmentServiceType,
  string
> = {
  [AppointmentServiceType.Maintenance]: "Mantenimiento",
  [AppointmentServiceType.Repair]: "Reparación",
  [AppointmentServiceType.Diagnosis]: "Diagnóstico",
  [AppointmentServiceType.Inspection]: "Inspección",
  [AppointmentServiceType.Cosmetic]: "Estética",
};

export type Appointment = {
  readonly id: EntityId;
  readonly customerId: EntityId;
  readonly vehicleId: EntityId;
  readonly branchId: EntityId;
  readonly advisorId?: EntityId | undefined;
  readonly scheduledAt: DateTimeIso;
  readonly durationMinutes: number;
  readonly serviceType: AppointmentServiceType;
  readonly status: AppointmentStatus;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type AppointmentListItem = {
  readonly id: EntityId;
  readonly scheduledAt: DateTimeIso;
  readonly status: AppointmentStatus;
  readonly serviceType: AppointmentServiceType;
  readonly customerId: EntityId;
  readonly customerName: string;
  readonly vehicleId: EntityId;
  readonly plate: string;
  readonly vehicleLabel: string;
};

export function appointmentDateKey(
  value: string | Date,
  timeZone: string = LIMA_TIME_ZONE,
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function todayDateKey(timeZone: string = LIMA_TIME_ZONE): string {
  return appointmentDateKey(new Date(), timeZone);
}

export function limaDateTimeIso(dateKey: string, time: string): DateTimeIso {
  return new Date(`${dateKey}T${time}:00${LIMA_UTC_OFFSET}`).toISOString();
}
