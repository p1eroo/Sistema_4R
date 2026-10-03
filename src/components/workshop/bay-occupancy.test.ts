import { describe, expect, it } from "vitest";

import { asEntityId } from "@/domain/shared";
import { BayStatus, type WorkshopBay } from "@/domain/workshop-ops";

import { bayOccupancy, formatBayCapacity } from "./bay-occupancy";

function bay(id: string, status: BayStatus): WorkshopBay {
  return {
    id: asEntityId(id),
    code: id,
    name: id,
    branchId: asEntityId("BR-LM"),
    status,
    updatedAt: "2026-02-20T08:30:00.000Z",
  };
}

describe("bayOccupancy", () => {
  it("counts seed-like occupancy and formats capacity", () => {
    const bays = [
      bay("BAY-0001", BayStatus.Occupied),
      bay("BAY-0002", BayStatus.Occupied),
      ...Array.from({ length: 22 }, (_, index) =>
        bay(`BAY-${String(index + 3).padStart(4, "0")}`, BayStatus.Free),
      ),
    ];

    const stats = bayOccupancy(bays);
    expect(stats).toEqual({
      occupied: 2,
      blocked: 0,
      free: 22,
      capacity: 24,
      percent: 8,
    });
    expect(formatBayCapacity(stats)).toBe("2 vehículos · 8%");
  });

  it("rounds 18 of 24 to 75 percent", () => {
    expect(
      bayOccupancy([
        ...Array.from({ length: 18 }, (_, index) =>
          bay(`OCC-${index}`, BayStatus.Occupied),
        ),
        ...Array.from({ length: 6 }, (_, index) =>
          bay(`FREE-${index}`, BayStatus.Free),
        ),
      ]).percent,
    ).toBe(75);
  });
});
