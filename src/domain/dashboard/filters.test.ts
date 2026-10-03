import { describe, expect, it } from "vitest";

import { dateKeyMatchesDashboardFilter } from "@/domain/dashboard/filters";

describe("dateKeyMatchesDashboardFilter", () => {
  const today = "2026-02-12";

  it("honors explicit from/to", () => {
    expect(
      dateKeyMatchesDashboardFilter(
        "2026-02-10",
        { from: "2026-02-11" },
        today,
      ),
    ).toBe(false);
    expect(
      dateKeyMatchesDashboardFilter(
        "2026-02-11",
        { from: "2026-02-11", to: "2026-02-12" },
        today,
      ),
    ).toBe(true);
  });

  it("limits to today range", () => {
    expect(
      dateKeyMatchesDashboardFilter("2026-02-11", { range: "today" }, today),
    ).toBe(false);
    expect(
      dateKeyMatchesDashboardFilter(today, { range: "today" }, today),
    ).toBe(true);
  });
});
