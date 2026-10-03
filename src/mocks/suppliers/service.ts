import { z, type ZodType } from "zod";

import { SupplierStatus, type Supplier } from "@/domain/suppliers";
import {
  supplierCreateSchema,
  supplierUpdateSchema,
  type SupplierCreateValues,
  type SupplierUpdateValues,
} from "@/domain/suppliers/schemas";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { supplierSeed } from "@/mocks/suppliers/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class SupplierNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el proveedor ${id}.`);
    this.name = "SupplierNotFoundError";
  }
}

export class SupplierValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos del proveedor no son válidos.");
    this.name = "SupplierValidationError";
    this.issues = issues;
  }
}

export type SupplierService = {
  list(query?: ListQuery): Promise<ListResult<Supplier>>;
  getById(id: EntityId): Promise<Supplier | undefined>;
  getByRuc(ruc: string): Promise<Supplier | undefined>;
  create(input: SupplierCreateValues): Promise<Supplier>;
  update(id: EntityId, input: SupplierUpdateValues): Promise<Supplier>;
  archive(id: EntityId): Promise<Supplier>;
};

const SORT_SELECTORS = {
  businessName: (supplier: Supplier) => supplier.businessName,
  ruc: (supplier: Supplier) => supplier.ruc,
  status: (supplier: Supplier) => supplier.status,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new SupplierValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function buildUpdatePatch(
  values: SupplierUpdateValues,
  now: DateTimeIso,
): Partial<Omit<Supplier, "id">> {
  return {
    ...(values.ruc !== undefined ? { ruc: values.ruc } : {}),
    ...(values.businessName !== undefined
      ? { businessName: values.businessName }
      : {}),
    ...(values.tradeName !== undefined ? { tradeName: values.tradeName } : {}),
    ...(values.contact !== undefined ? { contact: values.contact } : {}),
    ...(values.phone !== undefined ? { phone: values.phone } : {}),
    ...(values.email !== undefined ? { email: values.email } : {}),
    ...(values.address !== undefined ? { address: values.address } : {}),
    ...(values.paymentTerms !== undefined
      ? { paymentTerms: values.paymentTerms }
      : {}),
    ...(values.notes !== undefined ? { notes: values.notes } : {}),
    updatedAt: now,
  };
}

export function createSupplierService(
  repository: InMemoryRepository<Supplier> = createInMemoryRepository<Supplier>(
    { seed: supplierSeed, idPrefix: "SUP" },
  ),
): SupplierService {
  async function findByRuc(ruc: string): Promise<Supplier | undefined> {
    const all = await repository.getAll();
    return all.find((supplier) => supplier.ruc === ruc);
  }

  async function assertRucAvailable(
    ruc: string,
    ignoreId?: EntityId,
  ): Promise<void> {
    const conflict = await findByRuc(ruc);
    if (conflict && conflict.id !== ignoreId) {
      throw new SupplierValidationError([
        `Ya existe un proveedor con el RUC ${ruc}.`,
      ]);
    }
  }

  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["businessName", "tradeName", "ruc"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    getByRuc(ruc: string) {
      return findByRuc(ruc);
    },

    async create(input: SupplierCreateValues) {
      const values = parseOrThrow(supplierCreateSchema, input);
      await assertRucAvailable(values.ruc);
      const now = nowIso();

      return repository.create({
        ruc: values.ruc,
        businessName: values.businessName,
        ...(values.tradeName !== undefined
          ? { tradeName: values.tradeName }
          : {}),
        ...(values.contact !== undefined ? { contact: values.contact } : {}),
        ...(values.phone !== undefined ? { phone: values.phone } : {}),
        ...(values.email !== undefined ? { email: values.email } : {}),
        ...(values.address !== undefined ? { address: values.address } : {}),
        paymentTerms: values.paymentTerms,
        status: SupplierStatus.Active,
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async update(id: EntityId, input: SupplierUpdateValues) {
      const values = parseOrThrow(supplierUpdateSchema, input);
      const current = await repository.getById(id);
      if (!current) {
        throw new SupplierNotFoundError(id);
      }
      if (values.ruc !== undefined) {
        await assertRucAvailable(values.ruc, id);
      }

      return repository.update(id, buildUpdatePatch(values, nowIso()));
    },

    async archive(id: EntityId) {
      const current = await repository.getById(id);
      if (!current) {
        throw new SupplierNotFoundError(id);
      }

      return repository.update(id, {
        status: SupplierStatus.Inactive,
        updatedAt: nowIso(),
      });
    },
  };
}

export const supplierService: SupplierService = createSupplierService();
