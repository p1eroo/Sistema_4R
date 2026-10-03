import type { EntityId } from "@/domain/shared";

export type ReportKey = "sales" | "work-orders" | "inventory" | "receivables";

export type ReportRange = "today" | "week" | "month" | "year" | "all";

export type ReportQuery = {
  readonly key: ReportKey;
  readonly branchId?: EntityId | "all";
  readonly range?: ReportRange;
  readonly from?: string;
  readonly to?: string;
};

export type ReportColumnAlign = "left" | "right";

export type ReportColumn = {
  readonly key: string;
  readonly header: string;
  readonly align?: ReportColumnAlign;
};

export type ReportRow = Readonly<Record<string, string | number>>;

export type ReportDataset = {
  readonly key: ReportKey;
  readonly title: string;
  readonly columns: readonly ReportColumn[];
  readonly rows: readonly ReportRow[];
  readonly totals: Readonly<Record<string, number>>;
  readonly gaps: readonly string[];
};

export type ReportDefinition = {
  readonly key: ReportKey;
  readonly title: string;
  readonly description: string;
};

export function sumReportColumn(
  rows: readonly ReportRow[],
  column: string,
): number {
  return rows.reduce((acc, row) => {
    const value = row[column];
    return typeof value === "number" ? acc + value : acc;
  }, 0);
}

export function groupRowsBy(
  rows: readonly ReportRow[],
  column: string,
): Map<string, ReportRow[]> {
  const groups = new Map<string, ReportRow[]>();

  for (const row of rows) {
    const key = String(row[column] ?? "—");
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  return groups;
}
