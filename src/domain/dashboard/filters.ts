import { appointmentDateKey, todayDateKey } from "@/domain/appointments";
import type {
  DashboardFilters,
  DashboardRange,
} from "@/domain/dashboard/types";

export function defaultDashboardDateRange(): { from: string; to: string } {
  const to = todayDateKey();
  const fromDate = new Date(`${to}T12:00:00.000Z`);
  fromDate.setUTCDate(fromDate.getUTCDate() - 6);
  return { from: appointmentDateKey(fromDate), to };
}

export function dateKeyMatchesDashboardFilter(
  isoOrKey: string,
  filters: DashboardFilters,
  today: string = todayDateKey(),
): boolean {
  const key = isoOrKey.length === 10 ? isoOrKey : appointmentDateKey(isoOrKey);

  if (filters.from && key < filters.from) {
    return false;
  }
  if (filters.to && key > filters.to) {
    return false;
  }
  if (filters.from || filters.to) {
    return true;
  }

  const range: DashboardRange | undefined = filters.range;
  if (!range) {
    return true;
  }

  if (range === "today") {
    return key === today;
  }

  const windowDays = range === "month" ? 30 : 7;
  for (let offset = windowDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.parse(`${today}T12:00:00.000Z`) - offset * 86_400_000,
    );
    if (appointmentDateKey(date) === key) {
      return true;
    }
  }

  return false;
}
