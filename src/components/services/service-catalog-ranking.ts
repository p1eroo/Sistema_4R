import type { ServiceItem } from "@/domain/services";

export const DASHBOARD_SERVICE_RANKING = [
  "Mantenimiento preventivo",
  "Cambio de aceite",
  "Sistema de frenos",
  "Diagnóstico computarizado",
] as const;

export function serviceRankingIndex(name: string): number {
  return (DASHBOARD_SERVICE_RANKING as readonly string[]).indexOf(name);
}

export function isRankingService(name: string): boolean {
  return serviceRankingIndex(name) >= 0;
}

export function sortServicesForCatalog(
  items: readonly ServiceItem[],
): ServiceItem[] {
  return [...items].sort((left, right) => {
    const leftRank = serviceRankingIndex(left.name);
    const rightRank = serviceRankingIndex(right.name);
    const leftOrder = leftRank === -1 ? Number.POSITIVE_INFINITY : leftRank;
    const rightOrder = rightRank === -1 ? Number.POSITIVE_INFINITY : rightRank;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.name.localeCompare(right.name, "es");
  });
}

export function formatServiceDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} min`;
  }
  if (rest === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${rest} min`;
}
