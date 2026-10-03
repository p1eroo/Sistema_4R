import type { EntityId } from "@/domain/shared/ids";
import { asEntityId } from "@/domain/shared/ids";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import {
  includesQuery,
  paginate,
  sortBy,
  type SortValue,
} from "@/lib/list-query";

import { delay } from "@/mocks/shared/delay";

export type BaseEntity = {
  readonly id: EntityId;
};

export type RepositoryQuery<T> = {
  readonly query?: ListQuery;
  readonly searchFields?: readonly (keyof T)[];
  readonly sortSelectors?: Readonly<
    Partial<Record<string, (item: T) => SortValue>>
  >;
};

export type InMemoryRepository<T extends BaseEntity> = {
  getAll(): Promise<readonly T[]>;
  getById(id: EntityId): Promise<T | undefined>;
  create(input: Omit<T, "id">): Promise<T>;
  update(id: EntityId, patch: Partial<Omit<T, "id">>): Promise<T>;
  remove(id: EntityId): Promise<void>;
  query(options?: RepositoryQuery<T>): Promise<ListResult<T>>;
  setDelay(ms: number): void;
  failNext(error: Error): void;
};

export type InMemoryRepositoryOptions<T extends BaseEntity> = {
  readonly seed?: readonly T[];
  readonly delayMs?: number;
  readonly idPrefix?: string;
  readonly generateId?: () => EntityId;
};

export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryError";
  }
}

class InMemoryRepositoryImpl<
  T extends BaseEntity,
> implements InMemoryRepository<T> {
  private items: T[];
  private delayMs: number;
  private nextError: Error | null = null;
  private sequence: number;
  private readonly generateId: () => EntityId;

  constructor(options: InMemoryRepositoryOptions<T> = {}) {
    this.items = (options.seed ?? []).map(clone);
    this.delayMs = options.delayMs ?? 0;
    this.sequence = this.items.length;
    const prefix = options.idPrefix ?? "id";
    this.generateId =
      options.generateId ??
      (() => {
        this.sequence += 1;
        return asEntityId(
          `${prefix}-${String(this.sequence).padStart(4, "0")}`,
        );
      });
  }

  setDelay(ms: number): void {
    this.delayMs = Number.isFinite(ms) && ms > 0 ? ms : 0;
  }

  failNext(error: Error): void {
    this.nextError = error;
  }

  async getAll(): Promise<readonly T[]> {
    await this.gate();
    return this.items.map(clone);
  }

  async getById(id: EntityId): Promise<T | undefined> {
    await this.gate();
    const found = this.items.find((item) => item.id === id);
    return found ? clone(found) : undefined;
  }

  async create(input: Omit<T, "id">): Promise<T> {
    await this.gate();
    const entity = { ...input, id: this.generateId() } as T;
    this.items.push(entity);
    return clone(entity);
  }

  async update(id: EntityId, patch: Partial<Omit<T, "id">>): Promise<T> {
    await this.gate();
    const existing = this.items.find((item) => item.id === id);
    if (!existing) {
      throw new RepositoryError(`No se encontró el registro ${id}.`);
    }

    const updated = { ...existing, ...patch, id: existing.id } as T;
    this.items = this.items.map((item) => (item.id === id ? updated : item));
    return clone(updated);
  }

  async remove(id: EntityId): Promise<void> {
    await this.gate();
    const exists = this.items.some((item) => item.id === id);
    if (!exists) {
      throw new RepositoryError(`No se encontró el registro ${id}.`);
    }

    this.items = this.items.filter((item) => item.id !== id);
  }

  async query(options: RepositoryQuery<T> = {}): Promise<ListResult<T>> {
    await this.gate();
    const listQuery: ListQuery = options.query ?? {};
    const searchFields: readonly (keyof T)[] = options.searchFields ?? [];
    const sortSelectors: Readonly<
      Partial<Record<string, (item: T) => SortValue>>
    > = options.sortSelectors ?? {};

    let result: readonly T[] = this.items.map(clone);

    const search = listQuery.search;
    if (search && searchFields.length > 0) {
      result = result.filter((item) =>
        includesQuery(item, search, searchFields),
      );
    }

    const sortKey = listQuery.sortBy;
    if (sortKey) {
      const selector = sortSelectors[sortKey];
      if (selector) {
        result = sortBy(result, selector, listQuery.sortDir ?? "asc");
      }
    }

    return paginate(result, listQuery.page, listQuery.pageSize);
  }

  private async gate(): Promise<void> {
    await delay(this.delayMs);
    if (this.nextError) {
      const error = this.nextError;
      this.nextError = null;
      throw error;
    }
  }
}

export function createInMemoryRepository<T extends BaseEntity>(
  options: InMemoryRepositoryOptions<T> = {},
): InMemoryRepository<T> {
  return new InMemoryRepositoryImpl(options);
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
