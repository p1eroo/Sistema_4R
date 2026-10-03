import { appointmentDateKey, todayDateKey } from "@/domain/appointments";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { WorkOrderStatus } from "@/domain/work-orders";
import {
  createDeliveryChecklist,
  DeliveryStatus,
  type Delivery,
} from "@/domain/workshop-ops";
import { paginate } from "@/lib/list-query";
import { deliverySeed } from "@/mocks/workshop-ops/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";
import { workOrderService } from "@/mocks/work-orders/service";

export class DeliveryNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró la entrega ${id}.`);
    this.name = "DeliveryNotFoundError";
  }
}

export class DeliveryValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "La entrega no es válida.");
    this.name = "DeliveryValidationError";
    this.issues = issues;
  }
}

export type DeliveryScheduleInput = {
  readonly workOrderId: EntityId;
  readonly customerId: EntityId;
  readonly vehicleId: EntityId;
  readonly branchId: EntityId;
  readonly scheduledAt?: DateTimeIso | undefined;
  readonly notes?: string | undefined;
};

export type DeliveryDeliveredOptions = {
  readonly receivedBy?: string | undefined;
  readonly mileageKm?: number | undefined;
};

export type DeliveryService = {
  list(query?: ListQuery): Promise<ListResult<Delivery>>;
  listToday(query?: ListQuery): Promise<ListResult<Delivery>>;
  getById(id: EntityId): Promise<Delivery | undefined>;
  getByWorkOrder(workOrderId: EntityId): Promise<Delivery | undefined>;
  schedule(input: DeliveryScheduleInput): Promise<Delivery>;
  markReady(id: EntityId): Promise<Delivery>;
  markDelivered(
    id: EntityId,
    options?: DeliveryDeliveredOptions,
  ): Promise<Delivery>;
};

const SORT_SELECTORS = {
  scheduledAt: (delivery: Delivery) => delivery.scheduledAt,
  status: (delivery: Delivery) => delivery.status,
};

export function createDeliveryService(
  repository: InMemoryRepository<Delivery> = createInMemoryRepository<Delivery>(
    { seed: deliverySeed, idPrefix: "DLV" },
  ),
): DeliveryService {
  async function requireDelivery(id: EntityId): Promise<Delivery> {
    const delivery = await repository.getById(id);
    if (!delivery) {
      throw new DeliveryNotFoundError(id);
    }
    return delivery;
  }

  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["id", "status"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    async listToday(query: ListQuery = {}) {
      const today = todayDateKey();
      const all = await repository.getAll();
      const todayDeliveries = all.filter(
        (delivery) =>
          delivery.scheduledAt !== undefined &&
          appointmentDateKey(delivery.scheduledAt) === today,
      );
      return paginate(todayDeliveries, query.page, query.pageSize);
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async getByWorkOrder(workOrderId: EntityId) {
      const all = await repository.getAll();
      return all.find((delivery) => delivery.workOrderId === workOrderId);
    },

    async schedule(input: DeliveryScheduleInput) {
      const now = nowIso();
      return repository.create({
        workOrderId: input.workOrderId,
        customerId: input.customerId,
        vehicleId: input.vehicleId,
        branchId: input.branchId,
        status: DeliveryStatus.Scheduled,
        ...(input.scheduledAt !== undefined
          ? { scheduledAt: input.scheduledAt }
          : {}),
        checklist: createDeliveryChecklist(),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async markReady(id: EntityId) {
      await requireDelivery(id);
      return repository.update(id, {
        status: DeliveryStatus.Ready,
        updatedAt: nowIso(),
      });
    },

    async markDelivered(id: EntityId, options: DeliveryDeliveredOptions = {}) {
      const delivery = await requireDelivery(id);

      await workOrderService.updateStatus(
        delivery.workOrderId,
        WorkOrderStatus.Delivered,
      );

      return repository.update(id, {
        status: DeliveryStatus.Delivered,
        deliveredAt: nowIso(),
        checklist: createDeliveryChecklist([
          "documentos",
          "llaves",
          "accesorios",
          "pago",
          "conformidad",
        ]),
        ...(options.receivedBy !== undefined
          ? { receivedBy: options.receivedBy }
          : {}),
        ...(options.mileageKm !== undefined
          ? { mileageKm: options.mileageKm }
          : {}),
        updatedAt: nowIso(),
      });
    },
  };
}

export const deliveryService: DeliveryService = createDeliveryService();
