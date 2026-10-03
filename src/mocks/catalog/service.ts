import { z, type ZodType } from "zod";

import { CatalogStatus, type CatalogNamedEntity } from "@/domain/catalog";
import {
  brandCreateSchema,
  brandUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  lineCreateSchema,
  lineUpdateSchema,
} from "@/domain/catalog/schemas";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import type { SortValue } from "@/lib/list-query";
import { brandSeed, categorySeed, lineSeed } from "@/mocks/catalog/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class CatalogNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el registro de catálogo ${id}.`);
    this.name = "CatalogNotFoundError";
  }
}

export class CatalogValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos del catálogo no son válidos.");
    this.name = "CatalogValidationError";
    this.issues = issues;
  }
}

export type TaxonomyService<T extends CatalogNamedEntity, TCreate, TUpdate> = {
  list(query?: ListQuery): Promise<ListResult<T>>;
  getById(id: EntityId): Promise<T | undefined>;
  getByCode(code: string): Promise<T | undefined>;
  create(input: TCreate): Promise<T>;
  update(id: EntityId, input: TUpdate): Promise<T>;
  archive(id: EntityId): Promise<T>;
};

type TaxonomyConfig<
  T extends CatalogNamedEntity,
  TCreate extends { code: string },
  TUpdate extends { code?: string | undefined },
> = {
  readonly seed: readonly T[];
  readonly idPrefix: string;
  readonly createSchema: ZodType<TCreate>;
  readonly updateSchema: ZodType<TUpdate>;
  readonly toEntity: (values: TCreate, now: DateTimeIso) => Omit<T, "id">;
  readonly toPatch: (
    values: TUpdate,
    now: DateTimeIso,
  ) => Partial<Omit<T, "id">>;
  readonly sortSelectors: Record<string, (item: T) => SortValue>;
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new CatalogValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function createTaxonomyService<
  T extends CatalogNamedEntity,
  TCreate extends { code: string },
  TUpdate extends { code?: string | undefined },
>(
  config: TaxonomyConfig<T, TCreate, TUpdate>,
): TaxonomyService<T, TCreate, TUpdate> {
  const repository: InMemoryRepository<T> = createInMemoryRepository<T>({
    seed: config.seed,
    idPrefix: config.idPrefix,
  });
  const searchFields: readonly (keyof T)[] = ["code", "name"];

  async function findByCode(code: string): Promise<T | undefined> {
    const normalized = normalizeCode(code);
    const all = await repository.getAll();
    return all.find((item) => normalizeCode(item.code) === normalized);
  }

  async function assertCodeAvailable(
    code: string,
    ignoreId?: EntityId,
  ): Promise<void> {
    const conflict = await findByCode(code);
    if (conflict && conflict.id !== ignoreId) {
      throw new CatalogValidationError([
        `Ya existe un registro con el código ${normalizeCode(code)}.`,
      ]);
    }
  }

  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields,
        sortSelectors: config.sortSelectors,
      });
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    getByCode(code: string) {
      return findByCode(code);
    },

    async create(input: TCreate) {
      const values = parseOrThrow(config.createSchema, input);
      await assertCodeAvailable(values.code);
      return repository.create(config.toEntity(values, nowIso()));
    },

    async update(id: EntityId, input: TUpdate) {
      const values = parseOrThrow(config.updateSchema, input);
      const current = await repository.getById(id);
      if (!current) {
        throw new CatalogNotFoundError(id);
      }
      if (values.code !== undefined) {
        await assertCodeAvailable(values.code, id);
      }

      return repository.update(id, config.toPatch(values, nowIso()));
    },

    async archive(id: EntityId) {
      const current = await repository.getById(id);
      if (!current) {
        throw new CatalogNotFoundError(id);
      }

      return repository.update(id, {
        status: CatalogStatus.Inactive,
        updatedAt: nowIso(),
      } as Partial<Omit<T, "id">>);
    },
  };
}

export const categoryService = createTaxonomyService({
  seed: categorySeed,
  idPrefix: "CAT",
  createSchema: categoryCreateSchema,
  updateSchema: categoryUpdateSchema,
  toEntity: (values, now) => ({
    code: values.code,
    name: values.name,
    ...(values.description !== undefined
      ? { description: values.description }
      : {}),
    status: CatalogStatus.Active,
    createdAt: now,
    updatedAt: now,
  }),
  toPatch: (values, now) => ({
    ...(values.code !== undefined ? { code: values.code } : {}),
    ...(values.name !== undefined ? { name: values.name } : {}),
    ...(values.description !== undefined
      ? { description: values.description }
      : {}),
    updatedAt: now,
  }),
  sortSelectors: {
    code: (category) => category.code,
    name: (category) => category.name,
  },
});

export const brandService = createTaxonomyService({
  seed: brandSeed,
  idPrefix: "BRD",
  createSchema: brandCreateSchema,
  updateSchema: brandUpdateSchema,
  toEntity: (values, now) => ({
    code: values.code,
    name: values.name,
    ...(values.description !== undefined
      ? { description: values.description }
      : {}),
    status: CatalogStatus.Active,
    createdAt: now,
    updatedAt: now,
  }),
  toPatch: (values, now) => ({
    ...(values.code !== undefined ? { code: values.code } : {}),
    ...(values.name !== undefined ? { name: values.name } : {}),
    ...(values.description !== undefined
      ? { description: values.description }
      : {}),
    updatedAt: now,
  }),
  sortSelectors: {
    code: (brand) => brand.code,
    name: (brand) => brand.name,
  },
});

export const lineService = createTaxonomyService({
  seed: lineSeed,
  idPrefix: "LIN",
  createSchema: lineCreateSchema,
  updateSchema: lineUpdateSchema,
  toEntity: (values, now) => ({
    code: values.code,
    name: values.name,
    ...(values.brandId !== undefined ? { brandId: values.brandId } : {}),
    ...(values.categoryId !== undefined
      ? { categoryId: values.categoryId }
      : {}),
    status: CatalogStatus.Active,
    createdAt: now,
    updatedAt: now,
  }),
  toPatch: (values, now) => ({
    ...(values.code !== undefined ? { code: values.code } : {}),
    ...(values.name !== undefined ? { name: values.name } : {}),
    ...(values.brandId !== undefined ? { brandId: values.brandId } : {}),
    ...(values.categoryId !== undefined
      ? { categoryId: values.categoryId }
      : {}),
    updatedAt: now,
  }),
  sortSelectors: {
    code: (line) => line.code,
    name: (line) => line.name,
  },
});
