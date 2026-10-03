import { z, type ZodType } from "zod";

import {
  PurchaseStatus,
  type Expense,
  type Purchase,
  type PurchaseLine,
  type PurchaseOrder,
  type Quote,
} from "@/domain/purchases";
import {
  expenseCreateSchema,
  purchaseCreateSchema,
  purchaseOrderCreateSchema,
  quoteCreateSchema,
  type ExpenseCreateValues,
  type PurchaseCreateValues,
  type PurchaseOrderCreateValues,
  type QuoteCreateValues,
} from "@/domain/purchases/schemas";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { inventoryService } from "@/mocks/inventory/service";
import {
  expenseSeed,
  purchaseOrderSeed,
  purchaseSeed,
  quoteSeed,
} from "@/mocks/purchases/seed";
import { calculatePurchaseTotals } from "@/mocks/purchases/totals";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class PurchasesNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el documento de compra ${id}.`);
    this.name = "PurchasesNotFoundError";
  }
}

export class PurchasesValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "La operación de compras no es válida.");
    this.name = "PurchasesValidationError";
    this.issues = issues;
  }
}

export type PurchasesService = {
  listPurchases(query?: ListQuery): Promise<ListResult<Purchase>>;
  listOrders(query?: ListQuery): Promise<ListResult<PurchaseOrder>>;
  listQuotes(query?: ListQuery): Promise<ListResult<Quote>>;
  listExpenses(query?: ListQuery): Promise<ListResult<Expense>>;
  getPurchaseById(id: EntityId): Promise<Purchase | undefined>;
  createPurchase(input: PurchaseCreateValues): Promise<Purchase>;
  createOrder(input: PurchaseOrderCreateValues): Promise<PurchaseOrder>;
  createQuote(input: QuoteCreateValues): Promise<Quote>;
  createExpense(input: ExpenseCreateValues): Promise<Expense>;
  receivePurchase(id: EntityId): Promise<Purchase>;
};

const SORT_SELECTORS = {
  code: (record: { code: string }) => record.code,
  status: (record: { status: PurchaseStatus }) => record.status,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new PurchasesValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function nextCode(
  records: readonly { readonly code: string }[],
  prefix: string,
  now: DateTimeIso,
): string {
  const year = new Date(now).getUTCFullYear();
  const max = records.reduce((acc, record) => {
    const value = new RegExp(`^${prefix}-${year}-(\\d+)$`).exec(
      record.code,
    )?.[1];
    return value ? Math.max(acc, Number(value)) : acc;
  }, 0);

  return `${prefix}-${year}-${String(max + 1).padStart(4, "0")}`;
}

function countLines(
  records: readonly { readonly lines: readonly PurchaseLine[] }[],
): number {
  return records.reduce((acc, record) => acc + record.lines.length, 0);
}

function normalizeLines(
  lines: readonly {
    readonly id?: EntityId | undefined;
    readonly productId?: EntityId | undefined;
    readonly description: string;
    readonly quantity: number;
    readonly unitCost: PurchaseLine["unitCost"];
    readonly discount?: PurchaseLine["discount"];
    readonly igvRate?: number | undefined;
  }[],
  prefix: string,
  offset: number,
): PurchaseLine[] {
  return lines.map((line, index) => ({
    id:
      line.id ??
      (`${prefix}-${String(offset + index + 1).padStart(4, "0")}` as EntityId),
    description: line.description,
    quantity: line.quantity,
    unitCost: line.unitCost,
    igvRate: line.igvRate ?? 0.18,
    ...(line.productId !== undefined ? { productId: line.productId } : {}),
    ...(line.discount !== undefined ? { discount: line.discount } : {}),
  }));
}

export function createPurchasesService(
  purchaseRepository: InMemoryRepository<Purchase> = createInMemoryRepository<Purchase>(
    { seed: purchaseSeed, idPrefix: "PU" },
  ),
  orderRepository: InMemoryRepository<PurchaseOrder> = createInMemoryRepository<PurchaseOrder>(
    { seed: purchaseOrderSeed, idPrefix: "OC" },
  ),
  quoteRepository: InMemoryRepository<Quote> = createInMemoryRepository<Quote>({
    seed: quoteSeed,
    idPrefix: "COT",
  }),
  expenseRepository: InMemoryRepository<Expense> = createInMemoryRepository<Expense>(
    { seed: expenseSeed, idPrefix: "GAS" },
  ),
): PurchasesService {
  return {
    listPurchases(query: ListQuery = {}) {
      return purchaseRepository.query({
        query,
        searchFields: ["code", "invoiceNumber", "status"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    listOrders(query: ListQuery = {}) {
      return orderRepository.query({
        query,
        searchFields: ["code", "status"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    listQuotes(query: ListQuery = {}) {
      return quoteRepository.query({
        query,
        searchFields: ["code", "status"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    listExpenses(query: ListQuery = {}) {
      return expenseRepository.query({
        query,
        searchFields: ["code", "description", "category"],
        sortSelectors: {
          code: (expense: Expense) => expense.code,
          category: (expense: Expense) => expense.category,
          incurredAt: (expense: Expense) => expense.incurredAt,
        },
      });
    },

    getPurchaseById(id: EntityId) {
      return purchaseRepository.getById(id);
    },

    async createPurchase(input: PurchaseCreateValues) {
      const values = parseOrThrow(purchaseCreateSchema, input);
      const existing = await purchaseRepository.getAll();
      const lines = normalizeLines(values.lines, "PUL", countLines(existing));
      const now = nowIso();

      return purchaseRepository.create({
        code: nextCode(existing, "COM", now),
        supplierId: values.supplierId,
        branchId: values.branchId,
        status: PurchaseStatus.Draft,
        lines,
        totals: calculatePurchaseTotals(lines),
        ...(values.invoiceNumber !== undefined
          ? { invoiceNumber: values.invoiceNumber }
          : {}),
        ...(values.purchasedAt !== undefined
          ? { purchasedAt: values.purchasedAt }
          : {}),
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async createOrder(input: PurchaseOrderCreateValues) {
      const values = parseOrThrow(purchaseOrderCreateSchema, input);
      const existing = await orderRepository.getAll();
      const lines = normalizeLines(values.lines, "POL", countLines(existing));
      const now = nowIso();

      return orderRepository.create({
        code: nextCode(existing, "OC", now),
        supplierId: values.supplierId,
        branchId: values.branchId,
        status: PurchaseStatus.Draft,
        lines,
        totals: calculatePurchaseTotals(lines),
        ...(values.expectedAt !== undefined
          ? { expectedAt: values.expectedAt }
          : {}),
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async createQuote(input: QuoteCreateValues) {
      const values = parseOrThrow(quoteCreateSchema, input);
      const existing = await quoteRepository.getAll();
      const lines = normalizeLines(values.lines, "QTL", countLines(existing));
      const now = nowIso();

      return quoteRepository.create({
        code: nextCode(existing, "COT", now),
        supplierId: values.supplierId,
        branchId: values.branchId,
        status: PurchaseStatus.Draft,
        lines,
        totals: calculatePurchaseTotals(lines),
        ...(values.validUntil !== undefined
          ? { validUntil: values.validUntil }
          : {}),
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async createExpense(input: ExpenseCreateValues) {
      const values = parseOrThrow(expenseCreateSchema, input);
      const existing = await expenseRepository.getAll();
      const now = nowIso();
      const igvAmount = values.igv?.amount ?? 0;

      return expenseRepository.create({
        code: nextCode(existing, "GAS", now),
        ...(values.supplierId !== undefined
          ? { supplierId: values.supplierId }
          : {}),
        branchId: values.branchId,
        category: values.category,
        description: values.description,
        amount: values.amount,
        igv: values.igv ?? { amount: 0, currency: values.amount.currency },
        total: {
          amount: values.amount.amount + igvAmount,
          currency: values.amount.currency,
        },
        incurredAt: values.incurredAt,
        ...(values.documentNumber !== undefined
          ? { documentNumber: values.documentNumber }
          : {}),
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },

    async receivePurchase(id: EntityId) {
      const purchase = await purchaseRepository.getById(id);
      if (!purchase) {
        throw new PurchasesNotFoundError(id);
      }
      if (purchase.status === PurchaseStatus.Cancelled) {
        throw new PurchasesValidationError([
          "No se puede recibir una compra cancelada.",
        ]);
      }
      if (purchase.status === PurchaseStatus.Received) {
        return purchase;
      }

      for (const line of purchase.lines) {
        if (!line.productId) {
          continue;
        }

        const stock = await inventoryService.getStock(
          line.productId,
          purchase.branchId,
        );
        const current = stock[0];
        if (!current) {
          continue;
        }

        await inventoryService.adjust({
          productId: line.productId,
          branchId: purchase.branchId,
          newQuantity: current.quantity + line.quantity,
          reason: `Recepción de compra ${purchase.code}`,
        });
      }

      const now = nowIso();
      return purchaseRepository.update(id, {
        status: PurchaseStatus.Received,
        purchasedAt: now,
        updatedAt: now,
      });
    },
  };
}

export const purchasesService: PurchasesService = createPurchasesService();
