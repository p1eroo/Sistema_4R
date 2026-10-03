import { groupRowsBy } from "@/domain/reports/types";
import type { ReportDataset, ReportKey } from "@/domain/reports/types";

export type ReportChartPoint = {
  readonly label: string;
  readonly value: number;
};

export function buildReportChartPoints(
  dataset: ReportDataset,
): ReportChartPoint[] {
  switch (dataset.key as ReportKey) {
    case "sales": {
      const grouped = groupRowsBy(dataset.rows, "date");
      return [...grouped.entries()]
        .map(([label, rows]) => ({
          label,
          value: rows.reduce(
            (acc, row) =>
              acc + (typeof row["total"] === "number" ? row["total"] : 0),
            0,
          ),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    case "work-orders": {
      const grouped = groupRowsBy(dataset.rows, "status");
      return [...grouped.entries()].map(([label, rows]) => ({
        label,
        value: rows.length,
      }));
    }
    case "inventory": {
      return dataset.rows
        .filter((row) => row["critical"] === 1)
        .slice(0, 6)
        .map((row) => ({
          label: String(row["product"]),
          value: typeof row["stock"] === "number" ? row["stock"] : 0,
        }));
    }
    case "receivables": {
      const grouped = groupRowsBy(dataset.rows, "status");
      return [...grouped.entries()].map(([label, rows]) => ({
        label,
        value: rows.reduce(
          (acc, row) =>
            acc + (typeof row["total"] === "number" ? row["total"] : 0),
          0,
        ),
      }));
    }
    default:
      return [];
  }
}
