const LIMA_TIME_ZONE = "America/Lima";

export function formatCashShiftTime(openedAt: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(openedAt));
}

export function formatCashShiftLabel(openedAt: string): string {
  return `Turno desde ${formatCashShiftTime(openedAt)}`;
}
