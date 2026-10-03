import {
  appointmentDateKey,
  LIMA_TIME_ZONE,
  LIMA_UTC_OFFSET,
} from "@/domain/appointments";

export function formatLimaTime(value: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function dateFromDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00${LIMA_UTC_OFFSET}`);
}

export function shiftDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function startOfWeekDateKey(dateKey: string): string {
  const weekday = dateFromDateKey(dateKey).getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  return shiftDateKey(dateKey, mondayOffset);
}

export function weekDateKeys(
  dateKey: string,
): readonly [string, string, string, string, string, string, string] {
  const start = startOfWeekDateKey(dateKey);
  return [
    start,
    shiftDateKey(start, 1),
    shiftDateKey(start, 2),
    shiftDateKey(start, 3),
    shiftDateKey(start, 4),
    shiftDateKey(start, 5),
    shiftDateKey(start, 6),
  ];
}

export function formatLimaDateLabel(dateKey: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(dateFromDateKey(dateKey));
}

export function formatLimaWeekday(dateKey: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TIME_ZONE,
    weekday: "short",
    day: "numeric",
  }).format(dateFromDateKey(dateKey));
}

export function toDateKey(value: Date): string {
  return appointmentDateKey(value);
}
