import { PaymentMethod } from "@/domain/pos/types";
import type { DateTimeIso, EntityId, Money } from "@/domain/shared";
import { money } from "@/domain/shared";

export enum AdvanceStatus {
  Active = "active",
  Applied = "applied",
  Cancelled = "cancelled",
}

export const ADVANCE_STATUS_LABELS: Record<AdvanceStatus, string> = {
  [AdvanceStatus.Active]: "Con saldo",
  [AdvanceStatus.Applied]: "Aplicado",
  [AdvanceStatus.Cancelled]: "Anulado",
};

/** Métodos con los que se puede recibir un anticipo de cliente. */
export const ADVANCE_PAYMENT_METHODS = [
  PaymentMethod.Cash,
  PaymentMethod.Card,
  PaymentMethod.Yape,
  PaymentMethod.Plin,
  PaymentMethod.Transfer,
] as const;

export type AdvancePaymentMethod = (typeof ADVANCE_PAYMENT_METHODS)[number];

export type AdvanceApplication = {
  readonly id: EntityId;
  readonly ticketId?: EntityId | undefined;
  readonly reference: string;
  readonly amount: Money;
  readonly appliedAt: DateTimeIso;
};

export type CustomerAdvance = {
  readonly id: EntityId;
  readonly code: string;
  readonly customerId: EntityId;
  readonly branchId: EntityId;
  readonly method: AdvancePaymentMethod;
  readonly amount: Money;
  readonly applications: readonly AdvanceApplication[];
  readonly status: AdvanceStatus;
  readonly reference?: string | undefined;
  readonly concept?: string | undefined;
  readonly cancelReason?: string | undefined;
  readonly receivedAt: DateTimeIso;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export function advanceAppliedAmount(
  advance: Pick<CustomerAdvance, "amount" | "applications">,
): Money {
  return money(
    advance.applications.reduce((acc, item) => acc + item.amount.amount, 0),
    advance.amount.currency,
  );
}

export function advanceBalance(
  advance: Pick<CustomerAdvance, "amount" | "applications" | "status">,
): Money {
  if (advance.status === AdvanceStatus.Cancelled) {
    return money(0, advance.amount.currency);
  }

  return money(
    Math.max(0, advance.amount.amount - advanceAppliedAmount(advance).amount),
    advance.amount.currency,
  );
}

export function customerAdvanceBalance(
  advances: readonly CustomerAdvance[],
  customerId: string,
): Money {
  return money(
    advances
      .filter((advance) => advance.customerId === customerId)
      .reduce((acc, advance) => acc + advanceBalance(advance).amount, 0),
  );
}
