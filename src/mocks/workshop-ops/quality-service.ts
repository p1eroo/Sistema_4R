import { nowIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { WorkOrderStatus, type WorkOrder } from "@/domain/work-orders";
import {
  QualityResult,
  type QualityCheck,
  type QualityCheckItem,
} from "@/domain/workshop-ops";
import { qualitySeed } from "@/mocks/workshop-ops/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";
import { workOrderService } from "@/mocks/work-orders/service";

export class QualityValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "El control de calidad no es válido.");
    this.name = "QualityValidationError";
    this.issues = issues;
  }
}

export type QualityRecordResult = {
  readonly check: QualityCheck;
  readonly workOrder: WorkOrder;
};

export type QualityService = {
  list(query?: ListQuery): Promise<ListResult<QualityCheck>>;
  getById(id: EntityId): Promise<QualityCheck | undefined>;
  getByWorkOrder(workOrderId: EntityId): Promise<QualityCheck | undefined>;
  record(
    workOrderId: EntityId,
    items: readonly QualityCheckItem[],
  ): Promise<QualityRecordResult>;
};

const SORT_SELECTORS = {
  checkedAt: (check: QualityCheck) => check.checkedAt,
  result: (check: QualityCheck) => check.result,
};

export function createQualityService(
  repository: InMemoryRepository<QualityCheck> = createInMemoryRepository<QualityCheck>(
    { seed: qualitySeed, idPrefix: "QC" },
  ),
): QualityService {
  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["id", "result"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async getByWorkOrder(workOrderId: EntityId) {
      const all = await repository.getAll();
      return all.find((check) => check.workOrderId === workOrderId);
    },

    async record(workOrderId, items) {
      if (items.length === 0) {
        throw new QualityValidationError([
          "El control de calidad necesita al menos un ítem.",
        ]);
      }

      const result = items.every((item) => item.passed)
        ? QualityResult.Pass
        : QualityResult.Fail;
      const failureReasons = items
        .filter((item) => !item.passed)
        .map((item) => item.notes ?? `Falló: ${item.label}`);

      const check = await repository.create({
        workOrderId,
        result,
        items,
        failureReasons,
        checkedBy: undefined,
        checkedAt: nowIso(),
      });

      const workOrder = await workOrderService.updateStatus(
        workOrderId,
        result === QualityResult.Pass
          ? WorkOrderStatus.Ready
          : WorkOrderStatus.InRepair,
      );

      return { check, workOrder };
    },
  };
}

export const qualityService: QualityService = createQualityService();
