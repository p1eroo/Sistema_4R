import { describe, expect, it } from "vitest";

import { limaDateTimeIso } from "@/domain/appointments";

import {
  formatLimaTime,
  startOfWeekDateKey,
  weekDateKeys,
} from "./appointment-datetime";

describe("appointment-datetime", () => {
  it("formats Lima time and builds a Monday week", () => {
    expect(formatLimaTime(limaDateTimeIso("2026-09-25", "09:30"))).toBe(
      "09:30",
    );
    expect(startOfWeekDateKey("2026-09-25")).toBe("2026-09-21");
    expect(weekDateKeys("2026-09-25")).toEqual([
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
    ]);
  });
});
