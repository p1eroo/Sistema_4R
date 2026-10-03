import { describe, expect, it } from "vitest";

import {
  groupRowsBy,
  sumReportColumn,
  type ReportRow,
} from "@/domain/reports/types";
import { createReportsService } from "@/mocks/reports/service";

describe("reportsService.getReport", () => {
  it("returns sales rows with totals", async () => {
    const service = createReportsService();
    const dataset = await service.getReport({ key: "sales" });

    expect(dataset.rows.length).toBeGreaterThan(0);
    expect(dataset.totals["total"]).toBe(128000);
  });

  it("returns work order and inventory rows", async () => {
    const service = createReportsService();

    const workOrders = await service.getReport({ key: "work-orders" });
    expect(workOrders.totals["count"]).toBe(29);

    const inventory = await service.getReport({ key: "inventory" });
    expect(inventory.rows).toHaveLength(10);
    expect(inventory.totals["critical"]).toBe(7);
  });

  it("returns the receivables dataset with S/ 24,350 and 4 overdue", async () => {
    const service = createReportsService();
    const dataset = await service.getReport({ key: "receivables" });

    expect(dataset.totals["total"]).toBe(2435000);
    expect(dataset.totals["overdue"]).toBe(4);
    expect(dataset.rows).toHaveLength(5);
  });

  it("lists the four reports", () => {
    const service = createReportsService();

    expect(service.listReports().map((report) => report.key)).toEqual([
      "sales",
      "work-orders",
      "inventory",
      "receivables",
    ]);
  });
});

describe("report helpers", () => {
  const rows: ReportRow[] = [
    { category: "A", amount: 100 },
    { category: "B", amount: 200 },
    { category: "A", amount: 50 },
  ];

  it("sums a numeric column", () => {
    expect(sumReportColumn(rows, "amount")).toBe(350);
  });

  it("groups rows by column", () => {
    const grouped = groupRowsBy(rows, "category");

    expect(grouped.get("A")).toHaveLength(2);
    expect(grouped.get("B")).toHaveLength(1);
  });
});
