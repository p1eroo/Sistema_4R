import { z, type ZodType } from "zod";

import type { Branch } from "@/domain/branches";
import {
  branchUpdateSchema,
  type BranchUpdateValues,
} from "@/domain/branches/schemas";
import { nowIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { branchSeed } from "@/mocks/branches/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class BranchNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró la sede ${id}.`);
    this.name = "BranchNotFoundError";
  }
}

export class BranchValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos de la sede no son válidos.");
    this.name = "BranchValidationError";
    this.issues = issues;
  }
}

export type BranchService = {
  list(query?: ListQuery): Promise<ListResult<Branch>>;
  getById(id: EntityId): Promise<Branch | undefined>;
  getBySlug(slug: string): Promise<Branch | undefined>;
  getDefault(): Promise<Branch | undefined>;
  update(id: EntityId, input: BranchUpdateValues): Promise<Branch>;
};

const SORT_SELECTORS = {
  name: (branch: Branch) => branch.name,
  slug: (branch: Branch) => branch.slug,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new BranchValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

export function createBranchService(
  repository: InMemoryRepository<Branch> = createInMemoryRepository<Branch>({
    seed: branchSeed,
    idPrefix: "BR",
  }),
): BranchService {
  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["name", "slug"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async getBySlug(slug: string) {
      const normalized = slug.trim().toLowerCase();
      const all = await repository.getAll();
      return all.find((branch) => branch.slug === normalized);
    },

    async getDefault() {
      const all = await repository.getAll();
      return all.find((branch) => branch.isDefault);
    },

    async update(id: EntityId, input: BranchUpdateValues) {
      const values = parseOrThrow(branchUpdateSchema, input);
      const current = await repository.getById(id);
      if (!current) {
        throw new BranchNotFoundError(id);
      }

      if (values.isDefault) {
        const all = await repository.getAll();
        for (const branch of all) {
          if (branch.id !== id && branch.isDefault) {
            await repository.update(branch.id, { isDefault: false });
          }
        }
      }

      return repository.update(id, {
        ...(values.slug !== undefined ? { slug: values.slug } : {}),
        ...(values.name !== undefined ? { name: values.name } : {}),
        ...(values.address !== undefined ? { address: values.address } : {}),
        ...(values.phone !== undefined ? { phone: values.phone } : {}),
        ...(values.capacity !== undefined ? { capacity: values.capacity } : {}),
        ...(values.isDefault !== undefined
          ? { isDefault: values.isDefault }
          : {}),
        updatedAt: nowIso(),
      });
    },
  };
}

export const branchService: BranchService = createBranchService();
