import type { Pagination } from "@/domain/shared/pagination";

export type SortDir = "asc" | "desc";

export type DateRangeFilter = {
  readonly from?: string;
  readonly to?: string;
};

export type ListQuery = {
  readonly search?: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortBy?: string;
  readonly sortDir?: SortDir;
  readonly filters?: Readonly<Record<string, unknown>>;
};

export type ListResult<T> = {
  readonly items: readonly T[];
  readonly pagination: Pagination;
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
