import { describe, expect, it } from "vitest";

import { includesQuery, paginate, sortBy } from "@/lib/list-query";

type Row = { name: string; plate: string; order: number };

const lucia: Row = { name: "Lucía Ramos", plate: "ABC-123", order: 2 };
const rows: Row[] = [
  lucia,
  { name: "Carlos Mendoza", plate: "B4X-521", order: 1 },
  { name: "Ana Torres", plate: "F6T-884", order: 1 },
];

describe("paginate", () => {
  it("returns the requested page with 1-indexed pagination metadata", () => {
    const result = paginate(rows, 1, 2);

    expect(result.items).toHaveLength(2);
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 2,
      total: 3,
      totalPages: 2,
    });
  });

  it("handles an incomplete last page", () => {
    const result = paginate(rows, 2, 2);

    expect(result.items).toEqual([rows[2]]);
    expect(result.pagination.totalPages).toBe(2);
  });

  it("handles empty input and out-of-range pages", () => {
    expect(paginate([], 1, 10)).toEqual({
      items: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    });
    expect(paginate(rows, 99, 2).items).toEqual([]);
  });

  it("normalizes invalid page values", () => {
    const result = paginate(rows, 0, -5);

    expect(result.pagination.page).toBe(1);
    expect(result.pagination.pageSize).toBe(20);
  });
});

describe("sortBy", () => {
  it("sorts ascending and descending by selector", () => {
    expect(sortBy(rows, (row) => row.name).map((row) => row.name)).toEqual([
      "Ana Torres",
      "Carlos Mendoza",
      "Lucía Ramos",
    ]);
    expect(
      sortBy(rows, (row) => row.name, "desc").map((row) => row.name),
    ).toEqual(["Lucía Ramos", "Carlos Mendoza", "Ana Torres"]);
  });

  it("is stable for equal keys", () => {
    const sorted = sortBy(rows, (row) => row.order);

    expect(sorted.map((row) => row.name)).toEqual([
      "Carlos Mendoza",
      "Ana Torres",
      "Lucía Ramos",
    ]);
  });

  it("sorts nullish values last", () => {
    const sorted = sortBy([3, null, 1, undefined], (value) => value);

    expect(sorted).toEqual([1, 3, null, undefined]);
  });
});

describe("includesQuery", () => {
  it("matches case-insensitively across declared fields", () => {
    expect(includesQuery(lucia, "lucía", ["name"])).toBe(true);
    expect(includesQuery(lucia, "abc", ["plate", "name"])).toBe(true);
    expect(includesQuery(lucia, "zzz", ["plate", "name"])).toBe(false);
  });

  it("treats an empty query as a match", () => {
    expect(includesQuery(lucia, "   ", ["name"])).toBe(true);
  });
});
