import { z, type ZodType } from "zod";

import {
  createReceptionChecklist,
  FuelLevel,
  isReceptionEditable,
  ReceptionStatus,
  type Reception,
} from "@/domain/reception";
import {
  receptionCompleteSchema,
  receptionDraftSchema,
  receptionStepChecklistSchema,
  receptionStepPartySchema,
  type ReceptionChecklistValues,
  type ReceptionDraftValues,
  type ReceptionPartyValues,
} from "@/domain/reception/schemas";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";
import { receptionSeed } from "@/mocks/reception/seed";

export class ReceptionNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró la recepción ${id}.`);
    this.name = "ReceptionNotFoundError";
  }
}

export class ReceptionValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos de la recepción no son válidos.");
    this.name = "ReceptionValidationError";
    this.issues = issues;
  }
}

export type ReceptionStepInput =
  | { readonly step: "party"; readonly values: ReceptionPartyValues }
  | { readonly step: "checklist"; readonly values: ReceptionChecklistValues };

export type ReceptionService = {
  list(query?: ListQuery): Promise<ListResult<Reception>>;
  getById(id: EntityId): Promise<Reception | undefined>;
  createDraft(input: ReceptionDraftValues): Promise<Reception>;
  updateStep(id: EntityId, input: ReceptionStepInput): Promise<Reception>;
  complete(id: EntityId): Promise<Reception>;
};

const SEARCH_FIELDS: readonly (keyof Reception)[] = ["code", "reason"];

const SORT_SELECTORS = {
  code: (reception: Reception) => reception.code,
  createdAt: (reception: Reception) => reception.createdAt,
  status: (reception: Reception) => reception.status,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ReceptionValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function buildReceptionCode(sequence: number, now: DateTimeIso): string {
  const year = new Date(now).getUTCFullYear();
  return `REC-${year}-${String(sequence).padStart(4, "0")}`;
}

export function createReceptionService(
  repository: InMemoryRepository<Reception> = createInMemoryRepository<Reception>(
    { seed: receptionSeed, idPrefix: "RCP" },
  ),
): ReceptionService {
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

    async createDraft(input: ReceptionDraftValues) {
      const values = parseOrThrow(receptionDraftSchema, input);
      const now = nowIso();
      const existing = await repository.getAll();

      return repository.create({
        code: buildReceptionCode(existing.length + 1, now),
        customerId: values.customerId,
        vehicleId: values.vehicleId,
        branchId: values.branchId,
        ...(values.advisorId !== undefined
          ? { advisorId: values.advisorId }
          : {}),
        status: ReceptionStatus.Draft,
        reason: values.reason ?? "",
        odometerKm: values.odometerKm ?? 0,
        fuelLevel: values.fuelLevel ?? FuelLevel.Empty,
        belongings: values.belongings ?? [],
        checklist: values.checklist ?? createReceptionChecklist(),
        ...(values.observations !== undefined
          ? { observations: values.observations }
          : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async updateStep(id: EntityId, input: ReceptionStepInput) {
      const current = await repository.getById(id);
      if (!current) {
        throw new ReceptionNotFoundError(id);
      }
      if (!isReceptionEditable(current.status)) {
        throw new ReceptionValidationError([
          "La recepción ya no se puede editar.",
        ]);
      }

      const now = nowIso();

      if (input.step === "party") {
        const values = parseOrThrow(receptionStepPartySchema, input.values);
        return repository.update(id, {
          customerId: values.customerId,
          vehicleId: values.vehicleId,
          branchId: values.branchId,
          ...(values.advisorId !== undefined
            ? { advisorId: values.advisorId }
            : {}),
          reason: values.reason,
          status: ReceptionStatus.InProgress,
          updatedAt: now,
        });
      }

      const values = parseOrThrow(receptionStepChecklistSchema, input.values);
      return repository.update(id, {
        odometerKm: values.odometerKm,
        fuelLevel: values.fuelLevel,
        belongings: values.belongings,
        checklist: values.checklist,
        ...(values.observations !== undefined
          ? { observations: values.observations }
          : {}),
        status: ReceptionStatus.InProgress,
        updatedAt: now,
      });
    },

    async complete(id: EntityId) {
      const current = await repository.getById(id);
      if (!current) {
        throw new ReceptionNotFoundError(id);
      }
      if (current.status === ReceptionStatus.Cancelled) {
        throw new ReceptionValidationError([
          "No se puede completar una recepción cancelada.",
        ]);
      }

      parseOrThrow(receptionCompleteSchema, {
        customerId: current.customerId,
        vehicleId: current.vehicleId,
        branchId: current.branchId,
        ...(current.advisorId !== undefined
          ? { advisorId: current.advisorId }
          : {}),
        reason: current.reason,
        odometerKm: current.odometerKm,
        fuelLevel: current.fuelLevel,
        belongings: current.belongings,
        checklist: current.checklist,
        ...(current.observations !== undefined
          ? { observations: current.observations }
          : {}),
      });

      const now = nowIso();
      return repository.update(id, {
        status: ReceptionStatus.Completed,
        receivedAt: now,
        updatedAt: now,
      });
    },
  };
}

export const receptionService: ReceptionService = createReceptionService();
