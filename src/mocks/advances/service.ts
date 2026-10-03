import { z, type ZodType } from "zod";

import {
  AdvanceStatus,
  advanceApplySchema,
  advanceBalance,
  advanceCancelSchema,
  advanceCreateSchema,
  customerAdvanceBalance,
  type AdvanceApplication,
  type AdvanceApplyValues,
  type AdvanceCancelValues,
  type AdvanceCreateValues,
  type CustomerAdvance,
} from "@/domain/advances";
import {
  money,
  nowIso,
  type DateTimeIso,
  type EntityId,
  type Money,
} from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { customerAdvanceSeed } from "@/mocks/advances/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class AdvanceNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el anticipo ${id}.`);
    this.name = "AdvanceNotFoundError";
  }
}

export class AdvanceValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "La operación de anticipo no es válida.");
    this.name = "AdvanceValidationError";
    this.issues = issues;
  }
}

export type AdvanceService = {
  getAll(): Promise<readonly CustomerAdvance[]>;
  list(query?: ListQuery): Promise<ListResult<CustomerAdvance>>;
  getById(id: EntityId): Promise<CustomerAdvance | undefined>;
  search(term: string): Promise<readonly CustomerAdvance[]>;
  getCustomerBalance(customerId: EntityId): Promise<Money>;
  create(input: AdvanceCreateValues): Promise<CustomerAdvance>;
  /** Consume saldo de anticipos del cliente (FIFO por fecha de recepción). */
  apply(input: AdvanceApplyValues): Promise<CustomerAdvance[]>;
  archive(id: EntityId, input: AdvanceCancelValues): Promise<CustomerAdvance>;
};

const SORT_SELECTORS = {
  code: (advance: CustomerAdvance) => advance.code,
  receivedAt: (advance: CustomerAdvance) => advance.receivedAt,
  amount: (advance: CustomerAdvance) => advance.amount.amount,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new AdvanceValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function nextCode(
  advances: readonly CustomerAdvance[],
  now: DateTimeIso,
): string {
  const year = new Date(now).getUTCFullYear();
  const max = advances.reduce((acc, advance) => {
    const value = /^ANT-\d{4}-(\d+)$/.exec(advance.code)?.[1];
    return value ? Math.max(acc, Number(value)) : acc;
  }, 0);

  return `ANT-${year}-${String(max + 1).padStart(4, "0")}`;
}

function countApplications(advances: readonly CustomerAdvance[]): number {
  return advances.reduce((acc, item) => acc + item.applications.length, 0);
}

export function createAdvanceService(
  repository: InMemoryRepository<CustomerAdvance> = createInMemoryRepository<CustomerAdvance>(
    { seed: customerAdvanceSeed, idPrefix: "ADV" },
  ),
): AdvanceService {
  return {
    getAll() {
      return repository.getAll();
    },

    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["code", "reference", "concept", "status"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async search(term: string) {
      const result = await repository.query({
        query: { search: term, pageSize: 100 },
        searchFields: ["code", "reference", "concept"],
        sortSelectors: SORT_SELECTORS,
      });
      return result.items;
    },

    async getCustomerBalance(customerId: EntityId) {
      return customerAdvanceBalance(await repository.getAll(), customerId);
    },

    async create(input: AdvanceCreateValues) {
      const values = parseOrThrow(advanceCreateSchema, input);
      const all = await repository.getAll();
      const now = nowIso();

      return repository.create({
        code: nextCode(all, now),
        customerId: values.customerId,
        branchId: values.branchId,
        method: values.method,
        amount: values.amount,
        applications: [],
        status: AdvanceStatus.Active,
        ...(values.reference ? { reference: values.reference } : {}),
        ...(values.concept ? { concept: values.concept } : {}),
        receivedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    },

    async apply(input: AdvanceApplyValues) {
      const values = parseOrThrow(advanceApplySchema, input);
      const all = await repository.getAll();
      const available = all
        .filter(
          (advance) =>
            advance.customerId === values.customerId &&
            advance.status === AdvanceStatus.Active &&
            advanceBalance(advance).amount > 0,
        )
        .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
      const balance = available.reduce(
        (acc, advance) => acc + advanceBalance(advance).amount,
        0,
      );

      if (balance < values.amount.amount) {
        throw new AdvanceValidationError([
          "El cliente no tiene saldo de anticipo suficiente.",
        ]);
      }

      const now = nowIso();
      let remaining = values.amount.amount;
      let offset = countApplications(all);
      const updated: CustomerAdvance[] = [];

      for (const advance of available) {
        if (remaining <= 0) {
          break;
        }

        const take = Math.min(remaining, advanceBalance(advance).amount);
        remaining -= take;
        offset += 1;
        const application: AdvanceApplication = {
          id: `ADA-${String(offset).padStart(4, "0")}` as EntityId,
          reference: values.reference,
          amount: money(take, advance.amount.currency),
          appliedAt: now,
          ...(values.ticketId !== undefined
            ? { ticketId: values.ticketId }
            : {}),
        };
        const applications = [...advance.applications, application];
        const exhausted =
          advanceBalance({ ...advance, applications }).amount === 0;

        updated.push(
          await repository.update(advance.id, {
            applications,
            status: exhausted ? AdvanceStatus.Applied : AdvanceStatus.Active,
            updatedAt: now,
          }),
        );
      }

      return updated;
    },

    async archive(id: EntityId, input: AdvanceCancelValues) {
      const advance = await repository.getById(id);
      if (!advance) {
        throw new AdvanceNotFoundError(id);
      }
      if (advance.status === AdvanceStatus.Cancelled) {
        throw new AdvanceValidationError(["El anticipo ya está anulado."]);
      }
      if (advance.applications.length > 0) {
        throw new AdvanceValidationError([
          "No se puede anular un anticipo que ya fue aplicado a una venta.",
        ]);
      }

      const values = parseOrThrow(advanceCancelSchema, input);
      return repository.update(id, {
        status: AdvanceStatus.Cancelled,
        cancelReason: values.reason,
        updatedAt: nowIso(),
      });
    },
  };
}

export const advanceService: AdvanceService = createAdvanceService();
