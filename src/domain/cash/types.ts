import {
  money,
  type DateTimeIso,
  type EntityId,
  type Money,
} from "@/domain/shared";

export enum CashSessionStatus {
  Open = "open",
  Closed = "closed",
}

export const CASH_SESSION_STATUS_LABELS: Record<CashSessionStatus, string> = {
  [CashSessionStatus.Open]: "Abierta",
  [CashSessionStatus.Closed]: "Cerrada",
};

export enum CashMovementType {
  Sale = "sale",
  Deposit = "deposit",
  Withdrawal = "withdrawal",
  Expense = "expense",
  Refund = "refund",
  Adjustment = "adjustment",
}

export const CASH_MOVEMENT_TYPE_LABELS: Record<CashMovementType, string> = {
  [CashMovementType.Sale]: "Venta",
  [CashMovementType.Deposit]: "Ingreso",
  [CashMovementType.Withdrawal]: "Retiro",
  [CashMovementType.Expense]: "Gasto",
  [CashMovementType.Refund]: "Reembolso",
  [CashMovementType.Adjustment]: "Ajuste",
};

export type CashMovement = {
  readonly id: EntityId;
  readonly type: CashMovementType;
  readonly amount: Money;
  readonly reference?: string | undefined;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
};

export type CashSession = {
  readonly id: EntityId;
  readonly code: string;
  readonly branchId: EntityId;
  readonly branchSlug: string;
  readonly cashierId?: EntityId | undefined;
  readonly status: CashSessionStatus;
  readonly openingAmount: Money;
  readonly movements: readonly CashMovement[];
  readonly openedAt: DateTimeIso;
  readonly closedAt?: DateTimeIso | undefined;
  readonly closingAmount?: Money | undefined;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type CashSessionSummary = {
  readonly id: EntityId;
  readonly code: string;
  readonly branchId: EntityId;
  readonly branchSlug: string;
  readonly status: CashSessionStatus;
  readonly openedAt: DateTimeIso;
  readonly closedAt?: DateTimeIso | undefined;
  readonly openingAmount: Money;
  readonly expectedAmount: Money;
  readonly closingAmount?: Money | undefined;
  readonly difference?: Money | undefined;
  readonly movementCount: number;
};

export function cashMovementSign(type: CashMovementType): 1 | -1 {
  switch (type) {
    case CashMovementType.Sale:
    case CashMovementType.Deposit:
      return 1;
    case CashMovementType.Withdrawal:
    case CashMovementType.Expense:
    case CashMovementType.Refund:
      return -1;
    default:
      return 1;
  }
}

export function sumCashMovements(movements: readonly CashMovement[]): number {
  return movements.reduce(
    (acc, movement) =>
      acc + movement.amount.amount * cashMovementSign(movement.type),
    0,
  );
}

export function summarizeCashSession(session: CashSession): CashSessionSummary {
  const expectedAmount = money(
    session.openingAmount.amount + sumCashMovements(session.movements),
    session.openingAmount.currency,
  );
  const closingAmount = session.closingAmount;

  return {
    id: session.id,
    code: session.code,
    branchId: session.branchId,
    branchSlug: session.branchSlug,
    status: session.status,
    openedAt: session.openedAt,
    ...(session.closedAt !== undefined ? { closedAt: session.closedAt } : {}),
    openingAmount: session.openingAmount,
    expectedAmount,
    ...(closingAmount !== undefined
      ? {
          closingAmount,
          difference: money(
            closingAmount.amount - expectedAmount.amount,
            expectedAmount.currency,
          ),
        }
      : {}),
    movementCount: session.movements.length,
  };
}

/** Totales de ingresos y egresos de una sesión (en céntimos). */
export function cashFlowTotals(movements: readonly CashMovement[]): {
  inflow: number;
  outflow: number;
} {
  return movements.reduce(
    (acc, movement) =>
      cashMovementSign(movement.type) > 0
        ? { ...acc, inflow: acc.inflow + movement.amount.amount }
        : { ...acc, outflow: acc.outflow + movement.amount.amount },
    { inflow: 0, outflow: 0 },
  );
}
