import {
  buildEstimateCode,
  calculateEstimateTotals,
  DEFAULT_IGV_RATE,
  EstimateStatus,
  type Estimate,
  type EstimateLine,
} from "@/domain/estimates";
import {
  addMoney,
  money,
  nowIso,
  type DateTimeIso,
  type EntityId,
  type Money,
} from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { includesQuery, paginate, sortBy } from "@/lib/list-query";
import { estimateSeed } from "@/mocks/estimates/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class EstimateNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el presupuesto ${id}.`);
    this.name = "EstimateNotFoundError";
  }
}

export class EstimateValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos del presupuesto no son válidos.");
    this.name = "EstimateValidationError";
    this.issues = issues;
  }
}

export type EstimateCreateInput = {
  readonly customerId: EntityId;
  readonly vehicleId: EntityId;
  readonly workOrderId?: EntityId | undefined;
  readonly lines: readonly EstimateLine[];
  readonly globalDiscount?: Money | undefined;
  readonly igvRate?: number | undefined;
  readonly validUntil?: DateTimeIso | undefined;
  readonly notes?: string | undefined;
};

export type EstimateService = {
  list(query?: ListQuery): Promise<ListResult<Estimate>>;
  listByStatus(
    status: EstimateStatus,
    query?: ListQuery,
  ): Promise<ListResult<Estimate>>;
  getById(id: EntityId): Promise<Estimate | undefined>;
  sumPendingApproval(): Promise<Money>;
  create(input: EstimateCreateInput): Promise<Estimate>;
  updateStatus(id: EntityId, status: EstimateStatus): Promise<Estimate>;
};

const SEARCH_FIELDS: readonly (keyof Estimate)[] = ["code", "status"];

const SORT_SELECTORS = {
  code: (estimate: Estimate) => estimate.code,
  status: (estimate: Estimate) => estimate.status,
  total: (estimate: Estimate) => estimate.total.amount,
  createdAt: (estimate: Estimate) => estimate.createdAt,
};

function nextEstimateCode(
  existing: readonly Estimate[],
  now: DateTimeIso,
): string {
  const year = new Date(now).getUTCFullYear();
  const max = existing.reduce((acc, estimate) => {
    const sequence = /^EST-\d{4}-(\d+)$/.exec(estimate.code)?.[1];
    return sequence ? Math.max(acc, Number(sequence)) : acc;
  }, 0);

  return buildEstimateCode(year, max + 1);
}

function assertValidLines(lines: readonly EstimateLine[]): void {
  if (lines.length === 0) {
    throw new EstimateValidationError([
      "El presupuesto debe tener al menos una línea.",
    ]);
  }
  if (lines.some((line) => line.quantity <= 0 || line.unitPrice.amount < 0)) {
    throw new EstimateValidationError([
      "Las líneas deben tener cantidad positiva y precio válido.",
    ]);
  }
}

export function createEstimateService(
  repository: InMemoryRepository<Estimate> = createInMemoryRepository<Estimate>(
    {
      seed: estimateSeed,
      idPrefix: "EST",
    },
  ),
): EstimateService {
  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: SEARCH_FIELDS,
        sortSelectors: SORT_SELECTORS,
      });
    },

    async listByStatus(status: EstimateStatus, query: ListQuery = {}) {
      const all = await repository.getAll();
      let result: readonly Estimate[] = all.filter(
        (estimate) => estimate.status === status,
      );

      const search = query.search;
      if (search) {
        result = result.filter((estimate) =>
          includesQuery(estimate, search, SEARCH_FIELDS),
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

    getById(id: EntityId) {
      return repository.getById(id);
    },

    async sumPendingApproval() {
      const all = await repository.getAll();
      return all
        .filter(
          (estimate) => estimate.status === EstimateStatus.PendingApproval,
        )
        .reduce((acc, estimate) => addMoney(acc, estimate.total), money(0));
    },

    async create(input: EstimateCreateInput) {
      assertValidLines(input.lines);
      const totals = calculateEstimateTotals(input.lines, {
        ...(input.globalDiscount !== undefined
          ? { globalDiscount: input.globalDiscount }
          : {}),
        igvRate: input.igvRate ?? DEFAULT_IGV_RATE,
      });
      const existing = await repository.getAll();
      const now = nowIso();

      return repository.create({
        code: nextEstimateCode(existing, now),
        ...(input.workOrderId !== undefined
          ? { workOrderId: input.workOrderId }
          : {}),
        customerId: input.customerId,
        vehicleId: input.vehicleId,
        status: EstimateStatus.Draft,
        lines: input.lines,
        globalDiscount: input.globalDiscount ?? money(0),
        igvRate: input.igvRate ?? DEFAULT_IGV_RATE,
        subtotal: totals.subtotal,
        discount: totals.discount,
        igv: totals.igv,
        total: totals.total,
        ...(input.validUntil !== undefined
          ? { validUntil: input.validUntil }
          : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async updateStatus(id: EntityId, status: EstimateStatus) {
      const current = await repository.getById(id);
      if (!current) {
        throw new EstimateNotFoundError(id);
      }

      return repository.update(id, { status, updatedAt: nowIso() });
    },
  };
}

export const estimateService: EstimateService = createEstimateService();
