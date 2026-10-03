import { nowIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { WorkOrderStatus, type WorkOrder } from "@/domain/work-orders";
import { BayStatus, type WorkshopBay } from "@/domain/workshop-ops";
import { paginate } from "@/lib/list-query";
import { baySeed } from "@/mocks/workshop-ops/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";
import { workOrderService } from "@/mocks/work-orders/service";

export class BayNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró la bahía ${id}.`);
    this.name = "BayNotFoundError";
  }
}

export class BayValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "La operación de bahía no es válida.");
    this.name = "BayValidationError";
    this.issues = issues;
  }
}

export type BaysService = {
  list(query?: ListQuery): Promise<ListResult<WorkshopBay>>;
  listAvailable(query?: ListQuery): Promise<ListResult<WorkshopBay>>;
  getById(id: EntityId): Promise<WorkshopBay | undefined>;
  assign(bayId: EntityId, workOrderId: EntityId): Promise<WorkshopBay>;
  release(bayId: EntityId): Promise<WorkshopBay>;
  setStatus(bayId: EntityId, status: BayStatus): Promise<WorkshopBay>;
};

const SORT_SELECTORS = {
  code: (bay: WorkshopBay) => bay.code,
  status: (bay: WorkshopBay) => bay.status,
};

export function createBaysService(
  repository: InMemoryRepository<WorkshopBay> = createInMemoryRepository<WorkshopBay>(
    { seed: baySeed, idPrefix: "BAY" },
  ),
): BaysService {
  async function requireBay(id: EntityId): Promise<WorkshopBay> {
    const bay = await repository.getById(id);
    if (!bay) {
      throw new BayNotFoundError(id);
    }
    return bay;
  }

  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["code", "name"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    async listAvailable(query: ListQuery = {}) {
      const all = await repository.getAll();
      const free = all.filter((bay) => bay.status === BayStatus.Free);
      return paginate(free, query.page, query.pageSize);
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async assign(bayId: EntityId, workOrderId: EntityId) {
      const bay = await requireBay(bayId);
      if (bay.status === BayStatus.Blocked) {
        throw new BayValidationError(["La bahía está bloqueada."]);
      }
      if (bay.currentWorkOrderId) {
        throw new BayValidationError([
          `La bahía ${bay.code} ya está ocupada por la orden ${bay.currentWorkOrderId}.`,
        ]);
      }

      return repository.update(bayId, {
        status: BayStatus.Occupied,
        currentWorkOrderId: workOrderId,
        updatedAt: nowIso(),
      });
    },

    async release(bayId: EntityId) {
      await requireBay(bayId);
      return repository.update(bayId, {
        status: BayStatus.Free,
        currentWorkOrderId: undefined,
        updatedAt: nowIso(),
      });
    },

    async setStatus(bayId: EntityId, status: BayStatus) {
      await requireBay(bayId);
      return repository.update(bayId, { status, updatedAt: nowIso() });
    },
  };
}

export const baysService: BaysService = createBaysService();

export type WipService = {
  getBoard(): Promise<Record<WorkOrderStatus, readonly WorkOrder[]>>;
  assignToBay(workOrderId: EntityId, bayId: EntityId): Promise<WorkshopBay>;
  releaseBay(bayId: EntityId): Promise<WorkshopBay>;
  moveStatus(
    workOrderId: EntityId,
    status: WorkOrderStatus,
  ): Promise<WorkOrder>;
};

export function createWipService(bays: BaysService = baysService): WipService {
  const emptyBoard = (): Record<WorkOrderStatus, WorkOrder[]> => ({
    [WorkOrderStatus.Diagnosis]: [],
    [WorkOrderStatus.InRepair]: [],
    [WorkOrderStatus.Quality]: [],
    [WorkOrderStatus.Ready]: [],
    [WorkOrderStatus.Delivered]: [],
    [WorkOrderStatus.Cancelled]: [],
  });

  return {
    async getBoard() {
      const orders = await workOrderService.list({ pageSize: 500 });
      const board = emptyBoard();
      for (const order of orders.items) {
        board[order.status].push(order);
      }
      return board;
    },

    assignToBay(workOrderId, bayId) {
      return bays.assign(bayId, workOrderId);
    },

    releaseBay(bayId) {
      return bays.release(bayId);
    },

    moveStatus(workOrderId, status) {
      return workOrderService.updateStatus(workOrderId, status);
    },
  };
}

export const wipService: WipService = createWipService();
