import { BayStatus, type WorkshopBay } from "@/domain/workshop-ops";

export type BayOccupancy = {
  readonly occupied: number;
  readonly blocked: number;
  readonly free: number;
  readonly capacity: number;
  readonly percent: number;
};

export function bayOccupancy(bays: readonly WorkshopBay[]): BayOccupancy {
  const occupied = bays.filter(
    (bay) => bay.status === BayStatus.Occupied,
  ).length;
  const blocked = bays.filter((bay) => bay.status === BayStatus.Blocked).length;
  const free = bays.filter((bay) => bay.status === BayStatus.Free).length;
  const capacity = bays.length;
  const percent = capacity === 0 ? 0 : Math.round((occupied / capacity) * 100);

  return { occupied, blocked, free, capacity, percent };
}

export function formatBayCapacity(stats: BayOccupancy): string {
  return `${stats.occupied} vehículos · ${stats.percent}%`;
}
