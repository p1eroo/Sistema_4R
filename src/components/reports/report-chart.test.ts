import { describe, expect, it } from "vitest";

import { buildReportChartPoints } from "@/components/reports/report-chart";
import type { ReportDataset } from "@/domain/reports/types";

describe("buildReportChartPoints", () => {
  it("groups sales by date", () => {
    const dataset: ReportDataset = {
      key: "sales",
      title: "Ventas",
      columns: [],
      rows: [
        { code: "A", document: "F1", date: "2026-02-10", total: 1000 },
        { code: "B", document: "F2", date: "2026-02-10", total: 2000 },
      ],
      totals: {},
      gaps: [],
    };

    expect(buildReportChartPoints(dataset)).toEqual([
      { label: "2026-02-10", value: 3000 },
    ]);
  });
});
