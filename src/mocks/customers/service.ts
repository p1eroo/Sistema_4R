import type { ZodType } from "zod";

import {
  customerCreateSchema,
  customerUpdateSchema,
  type CustomerCreateValues,
  type CustomerUpdateValues,
} from "@/domain/customers/schemas";
import {
  CustomerStatus,
  customerDisplayName,
  type Customer,
  type CustomerNameParts,
  type CustomerType,
} from "@/domain/customers/types";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { customerSeed } from "@/mocks/customers/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class CustomerNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el cliente ${id}.`);
    this.name = "CustomerNotFoundError";
  }
}

export class CustomerValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos del cliente no son válidos.");
    this.name = "CustomerValidationError";
    this.issues = issues;
  }
}

export type CustomerService = {
  list(query?: ListQuery): Promise<ListResult<Customer>>;
  getById(id: EntityId): Promise<Customer | undefined>;
  create(input: CustomerCreateValues): Promise<Customer>;
  update(id: EntityId, input: CustomerUpdateValues): Promise<Customer>;
  archive(id: EntityId): Promise<Customer>;
  searchByDocOrName(
    term: string,
    query?: ListQuery,
  ): Promise<ListResult<Customer>>;
};

const SEARCH_FIELDS: readonly (keyof Customer)[] = [
  "displayName",
  "documentNumber",
  "email",
];

const SORT_SELECTORS = {
  displayName: (customer: Customer) => customer.displayName,
  documentNumber: (customer: Customer) => customer.documentNumber,
  createdAt: (customer: Customer) => customer.createdAt,
};

function parseOrThrow<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new CustomerValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function nameParts(
  type: CustomerType,
  values: {
    readonly firstName?: string | undefined;
    readonly lastName?: string | undefined;
    readonly businessName?: string | undefined;
  },
): CustomerNameParts {
  return {
    type,
    ...(values.firstName !== undefined ? { firstName: values.firstName } : {}),
    ...(values.lastName !== undefined ? { lastName: values.lastName } : {}),
    ...(values.businessName !== undefined
      ? { businessName: values.businessName }
      : {}),
  };
}

function buildCreatePayload(
  values: CustomerCreateValues,
  now: DateTimeIso,
): Omit<Customer, "id"> {
  const displayName = customerDisplayName(nameParts(values.type, values));

  return {
    type: values.type,
    documentType: values.documentType,
    documentNumber: values.documentNumber,
    displayName,
    ...(values.firstName !== undefined ? { firstName: values.firstName } : {}),
    ...(values.lastName !== undefined ? { lastName: values.lastName } : {}),
    ...(values.businessName !== undefined
      ? { businessName: values.businessName }
      : {}),
    phones: values.phones,
    ...(values.email !== undefined ? { email: values.email } : {}),
    ...(values.address !== undefined ? { address: values.address } : {}),
    ...(values.preferredBranch !== undefined
      ? { preferredBranch: values.preferredBranch }
      : {}),
    ...(values.notes !== undefined ? { notes: values.notes } : {}),
    status: CustomerStatus.Active,
    createdAt: now,
    updatedAt: now,
  };
}

function buildUpdatePatch(
  values: CustomerUpdateValues,
  current: Customer,
  now: DateTimeIso,
): Partial<Omit<Customer, "id">> {
  const nameChanged =
    values.type !== undefined ||
    values.firstName !== undefined ||
    values.lastName !== undefined ||
    values.businessName !== undefined;

  return {
    ...(values.type !== undefined ? { type: values.type } : {}),
    ...(values.documentType !== undefined
      ? { documentType: values.documentType }
      : {}),
    ...(values.documentNumber !== undefined
      ? { documentNumber: values.documentNumber }
      : {}),
    ...(values.firstName !== undefined ? { firstName: values.firstName } : {}),
    ...(values.lastName !== undefined ? { lastName: values.lastName } : {}),
    ...(values.businessName !== undefined
      ? { businessName: values.businessName }
      : {}),
    ...(values.phones !== undefined ? { phones: values.phones } : {}),
    ...(values.email !== undefined ? { email: values.email } : {}),
    ...(values.address !== undefined ? { address: values.address } : {}),
    ...(values.preferredBranch !== undefined
      ? { preferredBranch: values.preferredBranch }
      : {}),
    ...(values.notes !== undefined ? { notes: values.notes } : {}),
    ...(nameChanged
      ? {
          displayName: customerDisplayName(
            nameParts(values.type ?? current.type, {
              firstName: values.firstName ?? current.firstName,
              lastName: values.lastName ?? current.lastName,
              businessName: values.businessName ?? current.businessName,
            }),
          ),
        }
      : {}),
    updatedAt: now,
  };
}

export function createCustomerService(
  repository: InMemoryRepository<Customer> = createInMemoryRepository<Customer>(
    {
      seed: customerSeed,
      idPrefix: "CUS",
    },
  ),
): CustomerService {
  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: SEARCH_FIELDS,
        sortSelectors: SORT_SELECTORS,
      });
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async create(input: CustomerCreateValues) {
      const values = parseOrThrow(customerCreateSchema, input);
      return repository.create(buildCreatePayload(values, nowIso()));
    },

    async update(id: EntityId, input: CustomerUpdateValues) {
      const values = parseOrThrow(customerUpdateSchema, input);
      const current = await repository.getById(id);
      if (!current) {
        throw new CustomerNotFoundError(id);
      }

      return repository.update(id, buildUpdatePatch(values, current, nowIso()));
    },

    async archive(id: EntityId) {
      const current = await repository.getById(id);
      if (!current) {
        throw new CustomerNotFoundError(id);
      }

      return repository.update(id, {
        status: CustomerStatus.Archived,
        updatedAt: nowIso(),
      });
    },

    searchByDocOrName(term: string, query: ListQuery = {}) {
      return repository.query({
        query: { ...query, search: term },
        searchFields: ["documentNumber", "displayName"],
        sortSelectors: SORT_SELECTORS,
      });
    },
  };
}

export const customerService: CustomerService = createCustomerService();
