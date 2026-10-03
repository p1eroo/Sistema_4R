import { describe, expect, it } from "vitest";

import {
  dashboardPaths,
  resolveActivityHref,
  workOrderHref,
} from "@/components/dashboard/dashboard-links";

describe("dashboard-links", () => {
  it("maps POS and work order activities", () => {
    expect(
      resolveActivityHref({
        id: "activity-TK-0001",
        title: "Pago",
        meta: "",
        time: "08:00",
        tone: "info",
      }),
    ).toBe(dashboardPaths.pos);

    expect(
      resolveActivityHref({
        id: "activity-WO-0012",
        title: "OT en taller",
        meta: "",
        time: "09:00",
        tone: "neutral",
      }),
    ).toBe(workOrderHref("WO-0012"));
  });
});
