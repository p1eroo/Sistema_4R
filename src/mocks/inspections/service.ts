import {
  createInspectionChecklist,
  DamageSeverity,
  findDamageZone,
  InspectionStatus,
  INSPECTION_CHECKLIST_CATALOG,
  type DamagePoint,
  type DamageZoneId,
  type Inspection,
  type InspectionChecklistItem,
} from "@/domain/inspections";
import { asEntityId, nowIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { inspectionSeed } from "@/mocks/inspections/seed";
import { receptionService } from "@/mocks/reception/service";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class InspectionNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró la inspección ${id}.`);
    this.name = "InspectionNotFoundError";
  }
}

export class InspectionValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos de la inspección no son válidos.");
    this.name = "InspectionValidationError";
    this.issues = issues;
  }
}

export type DamagePointInput = {
  readonly zoneId: DamageZoneId;
  readonly severity: DamageSeverity;
  readonly notes?: string | undefined;
  readonly photos?: readonly string[] | undefined;
};

export type InspectionService = {
  list(query?: ListQuery): Promise<ListResult<Inspection>>;
  getById(id: EntityId): Promise<Inspection | undefined>;
  getByReception(receptionId: EntityId): Promise<Inspection | undefined>;
  saveChecklist(
    receptionId: EntityId,
    checklist: readonly InspectionChecklistItem[],
  ): Promise<Inspection>;
  upsertDamagePoint(
    receptionId: EntityId,
    input: DamagePointInput,
  ): Promise<Inspection>;
  removeDamagePoint(
    receptionId: EntityId,
    pointId: EntityId,
  ): Promise<Inspection>;
};

const SEARCH_FIELDS: readonly (keyof Inspection)[] = ["id", "status"];

const SORT_SELECTORS = {
  id: (inspection: Inspection) => inspection.id,
  status: (inspection: Inspection) => inspection.status,
  createdAt: (inspection: Inspection) => inspection.createdAt,
};

function nextDamagePointId(inspections: readonly Inspection[]): EntityId {
  const max = inspections
    .flatMap((inspection) => inspection.damagePoints)
    .reduce((acc, point) => {
      const value = /^DMP-(\d+)$/.exec(point.id)?.[1];
      return value ? Math.max(acc, Number(value)) : acc;
    }, 0);

  return asEntityId(`DMP-${String(max + 1).padStart(4, "0")}`);
}

export function createInspectionService(
  repository: InMemoryRepository<Inspection> = createInMemoryRepository<Inspection>(
    { seed: inspectionSeed, idPrefix: "INSP" },
  ),
): InspectionService {
  async function findByReception(
    receptionId: EntityId,
  ): Promise<Inspection | undefined> {
    const all = await repository.getAll();
    return all.find((inspection) => inspection.receptionId === receptionId);
  }

  async function getOrCreate(receptionId: EntityId): Promise<Inspection> {
    const existing = await findByReception(receptionId);
    if (existing) {
      return existing;
    }

    const reception = await receptionService.getById(receptionId);
    if (!reception) {
      throw new InspectionValidationError([
        `No se encontró la recepción ${receptionId}.`,
      ]);
    }

    const now = nowIso();
    return repository.create({
      receptionId,
      vehicleId: reception.vehicleId,
      status: InspectionStatus.Pending,
      damagePoints: [],
      checklist: createInspectionChecklist(),
      createdAt: now,
      updatedAt: now,
    });
  }

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

    getByReception(receptionId: EntityId) {
      return findByReception(receptionId);
    },

    async saveChecklist(receptionId, checklist) {
      const catalogIds = new Set(
        INSPECTION_CHECKLIST_CATALOG.map((item) => item.id),
      );
      if (checklist.some((item) => !catalogIds.has(item.id))) {
        throw new InspectionValidationError([
          "El checklist contiene ítems no válidos.",
        ]);
      }

      const inspection = await getOrCreate(receptionId);
      return repository.update(inspection.id, {
        checklist,
        status: InspectionStatus.InProgress,
        updatedAt: nowIso(),
      });
    },

    async upsertDamagePoint(receptionId, input) {
      if (!findDamageZone(input.zoneId)) {
        throw new InspectionValidationError([
          `La zona ${input.zoneId} no existe.`,
        ]);
      }

      const inspection = await getOrCreate(receptionId);
      const existing = inspection.damagePoints.find(
        (point) => point.zoneId === input.zoneId,
      );

      let damagePoints: readonly DamagePoint[];
      if (existing) {
        damagePoints = inspection.damagePoints.map((point) =>
          point.zoneId === input.zoneId
            ? {
                ...point,
                severity: input.severity,
                ...(input.notes !== undefined ? { notes: input.notes } : {}),
                photos: input.photos ? [...input.photos] : point.photos,
              }
            : point,
        );
      } else {
        const all = await repository.getAll();
        const point: DamagePoint = {
          id: nextDamagePointId(all),
          zoneId: input.zoneId,
          severity: input.severity,
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          photos: input.photos ? [...input.photos] : [],
        };
        damagePoints = [...inspection.damagePoints, point];
      }

      return repository.update(inspection.id, {
        damagePoints,
        status: InspectionStatus.InProgress,
        updatedAt: nowIso(),
      });
    },

    async removeDamagePoint(receptionId, pointId) {
      const inspection = await getOrCreate(receptionId);
      if (!inspection.damagePoints.some((point) => point.id === pointId)) {
        throw new InspectionValidationError([
          `No se encontró el daño ${pointId}.`,
        ]);
      }

      return repository.update(inspection.id, {
        damagePoints: inspection.damagePoints.filter(
          (point) => point.id !== pointId,
        ),
        updatedAt: nowIso(),
      });
    },
  };
}

export const inspectionService: InspectionService = createInspectionService();
