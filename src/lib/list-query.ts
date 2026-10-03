import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  type ListResult,
  type SortDir,
} from "@/domain/shared/list-query";
import { createPagination } from "@/domain/shared/pagination";

export type SortValue = string | number | boolean | null | undefined;

export function normalizePage(page: number | undefined): number {
  if (page === undefined || !Number.isFinite(page) || page < 1) {
    return DEFAULT_PAGE;
  }

  return Math.floor(page);
}

export function normalizePageSize(pageSize: number | undefined): number {
  if (pageSize === undefined || !Number.isFinite(pageSize) || pageSize < 1) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.floor(pageSize);
}

export function paginate<T>(
  items: readonly T[],
  page?: number,
  pageSize?: number,
): ListResult<T> {
  const safePage = normalizePage(page);
  const safePageSize = normalizePageSize(pageSize);
  const start = (safePage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    pagination: createPagination(safePage, safePageSize, items.length),
  };
}

export function sortBy<T>(
  items: readonly T[],
  selector: (item: T) => SortValue,
  direction: SortDir = "asc",
): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const compared = compareValues(selector(left.item), selector(right.item));
      if (compared === 0) {
        return left.index - right.index;
      }

      return direction === "desc" ? -compared : compared;
    })
    .map((entry) => entry.item);
}

export function includesQuery<T>(
  item: T,
  query: string,
  fields: readonly (keyof T)[],
): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return true;
  }

  return fields.some((field) => {
    const value = item[field];
    if (value === null || value === undefined) {
      return false;
    }

    return String(value).toLowerCase().includes(needle);
  });
}

function compareValues(a: SortValue, b: SortValue): number {
  if (a === b) {
    return 0;
  }

  const aNullish = a === null || a === undefined;
  const bNullish = b === null || b === undefined;
  if (aNullish || bNullish) {
    if (aNullish && bNullish) {
      return 0;
    }

    return aNullish ? 1 : -1;
  }

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b), "es");
}
