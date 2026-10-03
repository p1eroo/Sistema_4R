import {
  StockReturnDirection,
  type AdjustmentCreateValues,
} from "@/domain/inventory";
import type { EntityId } from "@/domain/shared";

export const INSUFFICIENT_STOCK_MESSAGE =
  "Stock insuficiente para el producto en la sede indicada.";

export const MISSING_BALANCE_MESSAGE =
  "No hay saldo para el producto en la sede indicada.";

export const PHYSICAL_COUNT_REASON = "Conteo físico";

export type ReturnPlan =
  | { readonly ok: true; readonly newQuantity: number }
  | { readonly ok: false; readonly message: string };

export function planReturnQuantity(
  current: number | undefined,
  direction: StockReturnDirection,
  quantity: number,
): ReturnPlan {
  if (current === undefined) {
    return { ok: false, message: MISSING_BALANCE_MESSAGE };
  }

  if (direction === StockReturnDirection.ToSupplier) {
    if (current < quantity) {
      return { ok: false, message: INSUFFICIENT_STOCK_MESSAGE };
    }
    return { ok: true, newQuantity: current - quantity };
  }

  return { ok: true, newQuantity: current + quantity };
}

export type PhysicalCountDraftLine = {
  readonly productId: EntityId;
  readonly expected: number;
  readonly counted: number;
};

export function planPhysicalAdjustments(
  branchId: EntityId,
  lines: readonly PhysicalCountDraftLine[],
  reason: string = PHYSICAL_COUNT_REASON,
): AdjustmentCreateValues[] {
  return lines
    .filter((line) => line.counted !== line.expected)
    .map((line) => ({
      productId: line.productId,
      branchId,
      newQuantity: line.counted,
      reason,
    }));
}
