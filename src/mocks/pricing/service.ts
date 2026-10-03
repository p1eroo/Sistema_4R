import { z, type ZodType } from "zod";

import {
  isPromotionActive,
  PromotionStatus,
  type Promotion,
} from "@/domain/pricing";
import {
  promotionCreateSchema,
  promotionUpdateSchema,
  type PromotionCreateValues,
  type PromotionUpdateValues,
} from "@/domain/pricing/schemas";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { paginate } from "@/lib/list-query";
import { promotionSeed } from "@/mocks/pricing/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class PromotionNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró la promoción ${id}.`);
    this.name = "PromotionNotFoundError";
  }
}

export class PromotionValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos de la promoción no son válidos.");
    this.name = "PromotionValidationError";
    this.issues = issues;
  }
}

export type PricingService = {
  list(query?: ListQuery): Promise<ListResult<Promotion>>;
  listActive(query?: ListQuery, at?: Date): Promise<ListResult<Promotion>>;
  getById(id: EntityId): Promise<Promotion | undefined>;
  getByCode(code: string): Promise<Promotion | undefined>;
  create(input: PromotionCreateValues): Promise<Promotion>;
  update(id: EntityId, input: PromotionUpdateValues): Promise<Promotion>;
  archive(id: EntityId): Promise<Promotion>;
};

const SORT_SELECTORS = {
  code: (promotion: Promotion) => promotion.code,
  name: (promotion: Promotion) => promotion.name,
  status: (promotion: Promotion) => promotion.status,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new PromotionValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function buildUpdatePatch(
  values: PromotionUpdateValues,
  now: DateTimeIso,
): Partial<Omit<Promotion, "id">> {
  return {
    ...(values.code !== undefined ? { code: values.code } : {}),
    ...(values.name !== undefined ? { name: values.name } : {}),
    ...(values.description !== undefined
      ? { description: values.description }
      : {}),
    ...(values.discount !== undefined ? { discount: values.discount } : {}),
    ...(values.scope !== undefined ? { scope: values.scope } : {}),
    ...(values.targetIds !== undefined ? { targetIds: values.targetIds } : {}),
    ...(values.startsAt !== undefined ? { startsAt: values.startsAt } : {}),
    ...(values.endsAt !== undefined ? { endsAt: values.endsAt } : {}),
    updatedAt: now,
  };
}

export function createPricingService(
  repository: InMemoryRepository<Promotion> = createInMemoryRepository<Promotion>(
    { seed: promotionSeed, idPrefix: "PROMO" },
  ),
): PricingService {
  async function findByCode(code: string): Promise<Promotion | undefined> {
    const normalized = normalizeCode(code);
    const all = await repository.getAll();
    return all.find(
      (promotion) => normalizeCode(promotion.code) === normalized,
    );
  }

  async function assertCodeAvailable(
    code: string,
    ignoreId?: EntityId,
  ): Promise<void> {
    const conflict = await findByCode(code);
    if (conflict && conflict.id !== ignoreId) {
      throw new PromotionValidationError([
        `Ya existe una promoción con el código ${normalizeCode(code)}.`,
      ]);
    }
  }

  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["code", "name", "status"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    async listActive(query: ListQuery = {}, at: Date = new Date()) {
      const all = await repository.getAll();
      const active = all.filter((promotion) =>
        isPromotionActive(promotion, at),
      );
      return paginate(active, query.page, query.pageSize);
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    getByCode(code: string) {
      return findByCode(code);
    },

    async create(input: PromotionCreateValues) {
      const values = parseOrThrow(promotionCreateSchema, input);
      await assertCodeAvailable(values.code);
      const now = nowIso();

      return repository.create({
        code: values.code,
        name: values.name,
        ...(values.description !== undefined
          ? { description: values.description }
          : {}),
        discount: values.discount,
        scope: values.scope,
        ...(values.targetIds !== undefined
          ? { targetIds: values.targetIds }
          : {}),
        status: PromotionStatus.Active,
        ...(values.startsAt !== undefined ? { startsAt: values.startsAt } : {}),
        ...(values.endsAt !== undefined ? { endsAt: values.endsAt } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async update(id: EntityId, input: PromotionUpdateValues) {
      const values = parseOrThrow(promotionUpdateSchema, input);
      const current = await repository.getById(id);
      if (!current) {
        throw new PromotionNotFoundError(id);
      }
      if (values.code !== undefined) {
        await assertCodeAvailable(values.code, id);
      }

      return repository.update(id, buildUpdatePatch(values, nowIso()));
    },

    async archive(id: EntityId) {
      const current = await repository.getById(id);
      if (!current) {
        throw new PromotionNotFoundError(id);
      }

      return repository.update(id, {
        status: PromotionStatus.Inactive,
        updatedAt: nowIso(),
      });
    },
  };
}

export const pricingService: PricingService = createPricingService();
