import { z, type ZodType } from "zod";

import {
  StockMovementReason,
  StockTransferStatus,
  type StockAdjustment,
  type StockBalance,
  type StockMovement,
  type StockTransfer,
} from "@/domain/inventory";
import {
  adjustmentCreateSchema,
  transferCreateSchema,
  type AdjustmentCreateValues,
  type TransferCreateValues,
} from "@/domain/inventory/schemas";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import { stockBalanceSeed, stockMovementSeed } from "@/mocks/inventory/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class InventoryNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el registro de inventario ${id}.`);
    this.name = "InventoryNotFoundError";
  }
}

export class InventoryValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "La operación de inventario no es válida.");
    this.name = "InventoryValidationError";
    this.issues = issues;
  }
}

export type InventoryService = {
  getStock(
    productId?: EntityId,
    branchId?: EntityId,
  ): Promise<readonly StockBalance[]>;
  listMovements(
    productId?: EntityId,
    branchId?: EntityId,
  ): Promise<readonly StockMovement[]>;
  listCritical(): Promise<readonly StockBalance[]>;
  listWithoutRestock(): Promise<readonly StockBalance[]>;
  kardex(
    productId: EntityId,
    branchId?: EntityId,
  ): Promise<readonly StockMovement[]>;
  transfer(input: TransferCreateValues): Promise<StockTransfer>;
  adjust(input: AdjustmentCreateValues): Promise<StockAdjustment>;
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new InventoryValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function findBalance(
  balances: readonly StockBalance[],
  productId: EntityId,
  branchId: EntityId,
): StockBalance | undefined {
  return balances.find(
    (balance) =>
      balance.productId === productId && balance.branchId === branchId,
  );
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

export function createInventoryService(
  balanceRepository: InMemoryRepository<StockBalance> = createInMemoryRepository<StockBalance>(
    { seed: stockBalanceSeed, idPrefix: "STK" },
  ),
  movementRepository: InMemoryRepository<StockMovement> = createInMemoryRepository<StockMovement>(
    { seed: stockMovementSeed, idPrefix: "MOV" },
  ),
  transferRepository: InMemoryRepository<StockTransfer> = createInMemoryRepository<StockTransfer>(
    { seed: [], idPrefix: "TRF" },
  ),
  adjustmentRepository: InMemoryRepository<StockAdjustment> = createInMemoryRepository<StockAdjustment>(
    { seed: [], idPrefix: "ADJ" },
  ),
): InventoryService {
  function matches(
    productId: EntityId | undefined,
    branchId: EntityId | undefined,
  ): (value: { productId: EntityId; branchId: EntityId }) => boolean {
    return (value) =>
      (productId === undefined || value.productId === productId) &&
      (branchId === undefined || value.branchId === branchId);
  }

  return {
    async getStock(productId, branchId) {
      const all = await balanceRepository.getAll();
      return all.filter(matches(productId, branchId));
    },

    async listMovements(productId, branchId) {
      const all = await movementRepository.getAll();
      return all
        .filter(matches(productId, branchId))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    async listCritical() {
      const all = await balanceRepository.getAll();
      return all.filter((balance) => balance.quantity <= balance.minStock);
    },

    async listWithoutRestock() {
      const all = await balanceRepository.getAll();
      return all.filter((balance) => !balance.restockable);
    },

    async kardex(productId, branchId) {
      const all = await movementRepository.getAll();
      return all
        .filter(matches(productId, branchId))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    async transfer(input: TransferCreateValues) {
      const values = parseOrThrow(transferCreateSchema, input);
      const now = nowIso();
      const balances = await balanceRepository.getAll();

      for (const line of values.lines) {
        const from = findBalance(balances, line.productId, values.fromBranchId);
        if (!from || from.quantity < line.quantity) {
          throw new InventoryValidationError([
            `Stock insuficiente para ${line.productId} en la sede de origen.`,
          ]);
        }
      }

      for (const line of values.lines) {
        const current = await balanceRepository.getAll();
        const from = findBalance(current, line.productId, values.fromBranchId);
        if (!from) {
          throw new InventoryValidationError([
            `No hay saldo para ${line.productId} en la sede de origen.`,
          ]);
        }

        const fromQuantity = from.quantity - line.quantity;
        await balanceRepository.update(from.id, {
          quantity: fromQuantity,
          updatedAt: now,
        });
        await movementRepository.create({
          productId: line.productId,
          branchId: values.fromBranchId,
          reason: StockMovementReason.TransferOut,
          quantity: -line.quantity,
          balanceAfter: fromQuantity,
          referenceType: "transfer",
          createdAt: now,
        });

        const to = findBalance(current, line.productId, values.toBranchId);
        const toQuantity = (to?.quantity ?? 0) + line.quantity;
        if (to) {
          await balanceRepository.update(to.id, {
            quantity: toQuantity,
            updatedAt: now,
          });
        } else {
          await balanceRepository.create({
            productId: line.productId,
            branchId: values.toBranchId,
            quantity: toQuantity,
            minStock: 0,
            restockable: true,
            updatedAt: now,
          });
        }
        await movementRepository.create({
          productId: line.productId,
          branchId: values.toBranchId,
          reason: StockMovementReason.TransferIn,
          quantity: line.quantity,
          balanceAfter: toQuantity,
          referenceType: "transfer",
          createdAt: now,
        });
      }

      const transfers = await transferRepository.getAll();
      return transferRepository.create({
        code: nextCode(transfers, "TRF", now),
        fromBranchId: values.fromBranchId,
        toBranchId: values.toBranchId,
        status: StockTransferStatus.Received,
        lines: values.lines,
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        receivedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    },

    async adjust(input: AdjustmentCreateValues) {
      const values = parseOrThrow(adjustmentCreateSchema, input);
      const balances = await balanceRepository.getAll();
      const current = findBalance(balances, values.productId, values.branchId);
      if (!current) {
        throw new InventoryValidationError([
          "No hay saldo para el producto en la sede indicada.",
        ]);
      }

      const now = nowIso();
      const delta = values.newQuantity - current.quantity;
      await balanceRepository.update(current.id, {
        quantity: values.newQuantity,
        updatedAt: now,
      });
      await movementRepository.create({
        productId: values.productId,
        branchId: values.branchId,
        reason: StockMovementReason.Adjustment,
        quantity: delta,
        balanceAfter: values.newQuantity,
        notes: values.reason,
        createdAt: now,
      });

      const adjustments = await adjustmentRepository.getAll();
      return adjustmentRepository.create({
        code: nextCode(adjustments, "AJU", now),
        productId: values.productId,
        branchId: values.branchId,
        quantity: delta,
        newQuantity: values.newQuantity,
        reason: values.reason,
        ...(values.notes !== undefined ? { notes: values.notes } : {}),
        createdAt: now,
        updatedAt: now,
      });
    },
  };
}

export const inventoryService: InventoryService = createInventoryService();
