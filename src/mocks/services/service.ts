import { z, type ZodType } from "zod";

import { ServiceStatus, type ServiceItem } from "@/domain/services";
import {
  serviceCreateSchema,
  serviceUpdateSchema,
  type ServiceCreateValues,
  type ServiceUpdateValues,
} from "@/domain/services/schemas";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { serviceSeed } from "@/mocks/services/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class ServiceNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el servicio ${id}.`);
    this.name = "ServiceNotFoundError";
  }
}

export class ServiceValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos del servicio no son válidos.");
    this.name = "ServiceValidationError";
    this.issues = issues;
  }
}

export type ServiceCatalog = {
  list(query?: ListQuery): Promise<ListResult<ServiceItem>>;
  getById(id: EntityId): Promise<ServiceItem | undefined>;
  getByCode(code: string): Promise<ServiceItem | undefined>;
  create(input: ServiceCreateValues): Promise<ServiceItem>;
  update(id: EntityId, input: ServiceUpdateValues): Promise<ServiceItem>;
  archive(id: EntityId): Promise<ServiceItem>;
};

const SORT_SELECTORS = {
  code: (service: ServiceItem) => service.code,
  name: (service: ServiceItem) => service.name,
  price: (service: ServiceItem) => service.price.amount,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ServiceValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function buildUpdatePatch(
  values: ServiceUpdateValues,
  now: DateTimeIso,
): Partial<Omit<ServiceItem, "id">> {
  return {
    ...(values.code !== undefined ? { code: values.code } : {}),
    ...(values.name !== undefined ? { name: values.name } : {}),
    ...(values.description !== undefined
      ? { description: values.description }
      : {}),
    ...(values.category !== undefined ? { category: values.category } : {}),
    ...(values.estimatedMinutes !== undefined
      ? { estimatedMinutes: values.estimatedMinutes }
      : {}),
    ...(values.price !== undefined ? { price: values.price } : {}),
    ...(values.igvRate !== undefined ? { igvRate: values.igvRate } : {}),
    updatedAt: now,
  };
}

export function createServiceCatalog(
  repository: InMemoryRepository<ServiceItem> = createInMemoryRepository<ServiceItem>(
    { seed: serviceSeed, idPrefix: "SRV" },
  ),
): ServiceCatalog {
  async function findByCode(code: string): Promise<ServiceItem | undefined> {
    const normalized = normalizeCode(code);
    const all = await repository.getAll();
    return all.find((service) => normalizeCode(service.code) === normalized);
  }

  async function assertCodeAvailable(
    code: string,
    ignoreId?: EntityId,
  ): Promise<void> {
    const conflict = await findByCode(code);
    if (conflict && conflict.id !== ignoreId) {
      throw new ServiceValidationError([
        `Ya existe un servicio con el código ${normalizeCode(code)}.`,
      ]);
    }
  }

  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["code", "name", "category"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    getByCode(code: string) {
      return findByCode(code);
    },

    async create(input: ServiceCreateValues) {
      const values = parseOrThrow(serviceCreateSchema, input);
      await assertCodeAvailable(values.code);
      const now = nowIso();

      return repository.create({
        code: values.code,
        name: values.name,
        ...(values.description !== undefined
          ? { description: values.description }
          : {}),
        category: values.category,
        estimatedMinutes: values.estimatedMinutes,
        price: values.price,
        igvRate: values.igvRate ?? 0.18,
        status: ServiceStatus.Active,
        createdAt: now,
        updatedAt: now,
      });
    },

    async update(id: EntityId, input: ServiceUpdateValues) {
      const values = parseOrThrow(serviceUpdateSchema, input);
      const current = await repository.getById(id);
      if (!current) {
        throw new ServiceNotFoundError(id);
      }
      if (values.code !== undefined) {
        await assertCodeAvailable(values.code, id);
      }

      return repository.update(id, buildUpdatePatch(values, nowIso()));
    },

    async archive(id: EntityId) {
      const current = await repository.getById(id);
      if (!current) {
        throw new ServiceNotFoundError(id);
      }

      return repository.update(id, {
        status: ServiceStatus.Inactive,
        updatedAt: nowIso(),
      });
    },
  };
}

export const serviceCatalog: ServiceCatalog = createServiceCatalog();
