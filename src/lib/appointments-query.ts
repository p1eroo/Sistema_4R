import {
  appointmentDateKey,
  LIMA_TIME_ZONE,
  type Appointment,
  type AppointmentStatus,
} from "@/domain/appointments";
import type { DateTimeIso, EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { includesQuery, paginate, sortBy } from "@/lib/list-query";

export enum AppointmentTimeBlock {
  Morning = "morning",
  Afternoon = "afternoon",
  Evening = "evening",
}

export const APPOINTMENT_TIME_BLOCK_LABELS: Record<
  AppointmentTimeBlock,
  string
> = {
  [AppointmentTimeBlock.Morning]: "Mañana",
  [AppointmentTimeBlock.Afternoon]: "Tarde",
  [AppointmentTimeBlock.Evening]: "Noche",
};

export type AppointmentFilter = {
  readonly date?: string | Date;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly advisorId?: EntityId;
  readonly branchId?: EntityId;
  readonly status?: AppointmentStatus | readonly AppointmentStatus[];
  readonly search?: string;
};

function toDateKey(value: string | Date): string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : appointmentDateKey(value);
}

function limaHour(value: DateTimeIso): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LIMA_TIME_ZONE,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date(value));

  return Number(parts.find((part) => part.type === "hour")?.value ?? "0");
}

export function appointmentTimeBlock(
  appointment: Appointment,
): AppointmentTimeBlock {
  const hour = limaHour(appointment.scheduledAt);
  if (hour < 12) {
    return AppointmentTimeBlock.Morning;
  }
  if (hour < 18) {
    return AppointmentTimeBlock.Afternoon;
  }

  return AppointmentTimeBlock.Evening;
}

export function filterAppointments(
  appointments: readonly Appointment[],
  filter: AppointmentFilter = {},
  query: ListQuery = {},
): ListResult<Appointment> {
  const dateKey =
    filter.date !== undefined ? toDateKey(filter.date) : undefined;
  const statuses =
    filter.status === undefined
      ? undefined
      : Array.isArray(filter.status)
        ? filter.status
        : [filter.status];

  let result = appointments.filter((appointment) => {
    const appointmentKey = appointmentDateKey(appointment.scheduledAt);

    if (dateKey && appointmentKey !== dateKey) {
      return false;
    }
    if (filter.fromDate && appointmentKey < filter.fromDate) {
      return false;
    }
    if (filter.toDate && appointmentKey > filter.toDate) {
      return false;
    }
    if (filter.advisorId && appointment.advisorId !== filter.advisorId) {
      return false;
    }
    if (filter.branchId && appointment.branchId !== filter.branchId) {
      return false;
    }
    if (statuses && !statuses.includes(appointment.status)) {
      return false;
    }

    return true;
  });

  const search = filter.search ?? query.search;
  if (search && search.trim().length > 0) {
    result = result.filter((appointment) =>
      includesQuery(appointment, search, ["id", "customerId", "vehicleId"]),
    );
  }

  return paginate(
    sortBy(result, (appointment) => appointment.scheduledAt, "asc"),
    query.page,
    query.pageSize,
  );
}

export function groupAppointmentsByTimeBlock(
  appointments: readonly Appointment[],
): Record<AppointmentTimeBlock, Appointment[]> {
  const groups: Record<AppointmentTimeBlock, Appointment[]> = {
    [AppointmentTimeBlock.Morning]: [],
    [AppointmentTimeBlock.Afternoon]: [],
    [AppointmentTimeBlock.Evening]: [],
  };

  for (const appointment of sortBy(
    appointments,
    (item) => item.scheduledAt,
    "asc",
  )) {
    groups[appointmentTimeBlock(appointment)].push(appointment);
  }

  return groups;
}
