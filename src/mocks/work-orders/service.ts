import { z, type ZodType } from "zod";

import { ReceptionStatus } from "@/domain/reception";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import {
  buildWorkOrderCode,
  WorkOrderPriority,
  type WorkOrder,
} from "@/domain/work-orders";
import {
  workOrderUpdateSchema,
  type WorkOrderUpdateValues,
} from "@/domain/work-orders/schemas";
import { WorkOrderStatus } from "@/domain/work-orders/status";
import { assertWorkOrderTransition } from "@/domain/work-orders/transitions";
import { includesQuery, paginate, sortBy } from "@/lib/list-query";
import { receptionService } from "@/mocks/reception/service";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";
import { workOrderSeed } from "@/mocks/work-orders/seed";

export class WorkOrderNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró la orden de trabajo ${id}.`);
    this.name = "WorkOrderNotFoundError";
  }
}

export class WorkOrderValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos de la orden no son válidos.");
    this.name = "WorkOrderValidationError";
    this.issues = issues;
  }
}

export type WorkOrderService = {
  list(query?: ListQuery): Promise<ListResult<WorkOrder>>;
  listByStatus(
    status: WorkOrderStatus,
    query?: ListQuery,
  ): Promise<ListResult<WorkOrder>>;
  countByStatus(): Promise<Record<WorkOrderStatus, number>>;
  getById(id: EntityId): Promise<WorkOrder | undefined>;
  createFromReception(receptionId: EntityId): Promise<WorkOrder>;
  update(id: EntityId, input: WorkOrderUpdateValues): Promise<WorkOrder>;
  updateStatus(id: EntityId, status: WorkOrderStatus): Promise<WorkOrder>;
};

const SEARCH_FIELDS: readonly (keyof WorkOrder)[] = [
  "code",
  "reason",
  "status",
];

const SORT_SELECTORS = {
  code: (order: WorkOrder) => order.code,
  status: (order: WorkOrder) => order.status,
  openedAt: (order: WorkOrder) => order.openedAt,
  priority: (order: WorkOrder) => order.priority,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new WorkOrderValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function nextWorkOrderCode(
  existing: readonly WorkOrder[],
  now: DateTimeIso,
): string {
  const year = new Date(now).getUTCFullYear();
  const max = existing.reduce((acc, order) => {
    const sequence = /^OT-\d{4}-(\d+)$/.exec(order.code)?.[1];
    return sequence ? Math.max(acc, Number(sequence)) : acc;
  }, 0);

  return buildWorkOrderCode(year, max + 1);
}

function buildUpdatePatch(
  values: WorkOrderUpdateValues,
  now: DateTimeIso,
): Partial<Omit<WorkOrder, "id">> {
  return {
    ...(values.customerId !== undefined
      ? { customerId: values.customerId }
      : {}),
    ...(values.vehicleId !== undefined ? { vehicleId: values.vehicleId } : {}),
    ...(values.branchId !== undefined ? { branchId: values.branchId } : {}),
    ...(values.advisorId !== undefined ? { advisorId: values.advisorId } : {}),
    ...(values.technicianId !== undefined
      ? { technicianId: values.technicianId }
      : {}),
    ...(values.receptionId !== undefined
      ? { receptionId: values.receptionId }
      : {}),
    ...(values.estimateId !== undefined
      ? { estimateId: values.estimateId }
      : {}),
    ...(values.bayId !== undefined ? { bayId: values.bayId } : {}),
    ...(values.reason !== undefined ? { reason: values.reason } : {}),
    ...(values.odometerKm !== undefined
      ? { odometerKm: values.odometerKm }
      : {}),
    ...(values.priority !== undefined ? { priority: values.priority } : {}),
    ...(values.promisedAt !== undefined
      ? { promisedAt: values.promisedAt }
      : {}),
    ...(values.notes !== undefined ? { notes: values.notes } : {}),
    updatedAt: now,
  };
}

export function createWorkOrderService(
  repository: InMemoryRepository<WorkOrder> = createInMemoryRepository<WorkOrder>(
    { seed: workOrderSeed, idPrefix: "WO" },
  ),
): WorkOrderService {
  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: SEARCH_FIELDS,
        sortSelectors: SORT_SELECTORS,
      });
    },

    async listByStatus(status: WorkOrderStatus, query: ListQuery = {}) {
      const all = await repository.getAll();
      let result: readonly WorkOrder[] = all.filter(
        (order) => order.status === status,
      );

      const search = query.search;
      if (search) {
        result = result.filter((order) =>
          includesQuery(order, search, SEARCH_FIELDS),
        );
      }

      const sortKey = query.sortBy;
      if (sortKey) {
        const selector = SORT_SELECTORS[sortKey as keyof typeof SORT_SELECTORS];
        if (selector) {
          result = sortBy(result, selector, query.sortDir ?? "asc");
        }
      }

      return paginate(result, query.page, query.pageSize);
    },

    async countByStatus() {
      const all = await repository.getAll();
      const counts: Record<WorkOrderStatus, number> = {
        [WorkOrderStatus.Diagnosis]: 0,
        [WorkOrderStatus.InRepair]: 0,
        [WorkOrderStatus.Quality]: 0,
        [WorkOrderStatus.Ready]: 0,
        [WorkOrderStatus.Delivered]: 0,
        [WorkOrderStatus.Cancelled]: 0,
      };

      for (const order of all) {
        counts[order.status] += 1;
      }

      return counts;
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async createFromReception(receptionId: EntityId) {
      const reception = await receptionService.getById(receptionId);
      if (!reception) {
        throw new WorkOrderValidationError([
          `No se encontró la recepción ${receptionId}.`,
        ]);
      }
      if (reception.status !== ReceptionStatus.Completed) {
        throw new WorkOrderValidationError([
          "La recepción debe estar completada para crear una orden de trabajo.",
        ]);
      }

      const existing = await repository.getAll();
      const now = nowIso();

      return repository.create({
        code: nextWorkOrderCode(existing, now),
        customerId: reception.customerId,
        vehicleId: reception.vehicleId,
        branchId: reception.branchId,
        ...(reception.advisorId !== undefined
          ? { advisorId: reception.advisorId }
          : {}),
        receptionId: reception.id,
        status: WorkOrderStatus.Diagnosis,
        priority: WorkOrderPriority.Normal,
        reason: reception.reason || "Recepción de vehículo",
        odometerKm: reception.odometerKm,
        openedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    },

    async update(id: EntityId, input: WorkOrderUpdateValues) {
      const values = parseOrThrow(workOrderUpdateSchema, input);
      const current = await repository.getById(id);
      if (!current) {
        throw new WorkOrderNotFoundError(id);
      }

      return repository.update(id, buildUpdatePatch(values, nowIso()));
    },

    async updateStatus(id: EntityId, status: WorkOrderStatus) {
      const current = await repository.getById(id);
      if (!current) {
        throw new WorkOrderNotFoundError(id);
      }

      if (current.status !== status) {
        assertWorkOrderTransition(current.status, status);
      }

      const now = nowIso();
      return repository.update(id, {
        status,
        ...(status === WorkOrderStatus.Delivered ? { closedAt: now } : {}),
        updatedAt: now,
      });
    },
  };
}

export const workOrderService: WorkOrderService = createWorkOrderService();
