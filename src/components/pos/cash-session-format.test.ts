import { describe, expect, it } from "vitest";

import { formatCashShiftLabel } from "@/components/pos/cash-session-format";

describe("formatCashShiftLabel", () => {
  it("formats Lima shift time", () => {
    expect(formatCashShiftLabel("2026-02-12T13:00:00.000Z")).toMatch(
      /^Turno desde \d{2}:\d{2}$/,
    );
  });
});
