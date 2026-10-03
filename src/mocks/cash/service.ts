import { z, type ZodType } from "zod";

import {
  CashSessionStatus,
  summarizeCashSession,
  type CashMovement,
  type CashSession,
  type CashSessionSummary,
} from "@/domain/cash";
import {
  cashCloseSchema,
  cashMovementSchema,
  cashOpenSchema,
  type CashCloseValues,
  type CashMovementValues,
  type CashOpenValues,
} from "@/domain/cash/schemas";
import {
  money,
  nowIso,
  type DateTimeIso,
  type EntityId,
} from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { cashSessionSeed } from "@/mocks/cash/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class CashNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró la sesión de caja ${id}.`);
    this.name = "CashNotFoundError";
  }
}

export class CashValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "La operación de caja no es válida.");
    this.name = "CashValidationError";
    this.issues = issues;
  }
}

export type CashService = {
  list(query?: ListQuery): Promise<ListResult<CashSession>>;
  getById(id: EntityId): Promise<CashSession | undefined>;
  getCurrent(branch: string): Promise<CashSessionSummary | undefined>;
  open(input: CashOpenValues): Promise<CashSession>;
  close(id: EntityId, input: CashCloseValues): Promise<CashSession>;
  addMovement(id: EntityId, input: CashMovementValues): Promise<CashSession>;
};

const SORT_SELECTORS = {
  openedAt: (session: CashSession) => session.openedAt,
  code: (session: CashSession) => session.code,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new CashValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function nextCode(sessions: readonly CashSession[], now: DateTimeIso): string {
  const year = new Date(now).getUTCFullYear();
  const max = sessions.reduce((acc, session) => {
    const value = /^CAJ-\d{4}-(\d+)$/.exec(session.code)?.[1];
    return value ? Math.max(acc, Number(value)) : acc;
  }, 0);

  return `CAJ-${year}-${String(max + 1).padStart(4, "0")}`;
}

export function createCashService(
  repository: InMemoryRepository<CashSession> = createInMemoryRepository<CashSession>(
    { seed: cashSessionSeed, idPrefix: "CS" },
  ),
): CashService {
  async function requireSession(id: EntityId): Promise<CashSession> {
    const session = await repository.getById(id);
    if (!session) {
      throw new CashNotFoundError(id);
    }
    return session;
  }

  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["code", "branchSlug", "status"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async getCurrent(branch: string) {
      const all = await repository.getAll();
      const session = all.find(
        (item) =>
          item.status === CashSessionStatus.Open &&
          (item.branchSlug === branch || item.branchId === branch),
      );
      return session ? summarizeCashSession(session) : undefined;
    },

    async open(input: CashOpenValues) {
      const values = parseOrThrow(cashOpenSchema, input);
      const all = await repository.getAll();
      const existing = all.find(
        (session) =>
          session.status === CashSessionStatus.Open &&
          (session.branchSlug === values.branchSlug ||
            session.branchId === values.branchId),
      );
      if (existing) {
        throw new CashValidationError([
          "Ya existe una sesión de caja abierta para la sede.",
        ]);
      }

      const now = nowIso();
      return repository.create({
        code: nextCode(all, now),
        branchId: values.branchId,
        branchSlug: values.branchSlug,
        ...(values.cashierId !== undefined
          ? { cashierId: values.cashierId }
          : {}),
        status: CashSessionStatus.Open,
        openingAmount: values.openingAmount,
        movements: [],
        openedAt: now,
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async close(id: EntityId, input: CashCloseValues) {
      const session = await requireSession(id);
      if (session.status === CashSessionStatus.Closed) {
        throw new CashValidationError(["La sesión de caja ya está cerrada."]);
      }

      const values = parseOrThrow(cashCloseSchema, input);
      const now = nowIso();
      return repository.update(id, {
        status: CashSessionStatus.Closed,
        closedAt: now,
        closingAmount: values.closingAmount,
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        updatedAt: now,
      });
    },

    async addMovement(id: EntityId, input: CashMovementValues) {
      const session = await requireSession(id);
      if (session.status !== CashSessionStatus.Open) {
        throw new CashValidationError([
          "No se pueden agregar movimientos a una sesión cerrada.",
        ]);
      }

      const values = parseOrThrow(cashMovementSchema, input);
      const movement: CashMovement = {
        id: `CM-${String(session.movements.length + 1).padStart(4, "0")}` as EntityId,
        type: values.type,
        amount: values.amount,
        ...(values.reference !== undefined
          ? { reference: values.reference }
          : {}),
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        createdAt: nowIso(),
      };

      const now = nowIso();
      return repository.update(id, {
        movements: [...session.movements, movement],
        updatedAt: now,
      });
    },
  };
}

export const cashService: CashService = createCashService();
