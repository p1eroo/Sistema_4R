import { solesToMoney } from "@/components/estimates/estimate-money";
import { PaymentMethod, type PosTotals } from "@/domain/pos";
import type { PosPaymentValues } from "@/domain/pos/schemas";
import { money, type Money } from "@/domain/shared";

export type PosPaymentRow = {
  readonly id: string;
  readonly method: PaymentMethod;
  readonly amountSoles: string;
  readonly reference?: string;
};

export const POS_CHECKOUT_METHODS: readonly PaymentMethod[] = [
  PaymentMethod.Cash,
  PaymentMethod.Card,
  PaymentMethod.Yape,
  PaymentMethod.Plin,
  PaymentMethod.Transfer,
  PaymentMethod.Advance,
];

export function createPaymentRow(
  method: PaymentMethod = PaymentMethod.Cash,
  amountSoles = "",
): PosPaymentRow {
  return {
    id: crypto.randomUUID(),
    method,
    amountSoles,
  };
}

export function sumPaymentRows(rows: readonly PosPaymentRow[]): Money {
  const currency = "PEN" as const;
  const amount = rows.reduce(
    (acc, row) => acc + solesToMoney(row.amountSoles).amount,
    0,
  );
  return money(amount, currency);
}

export function paymentShortfall(
  rows: readonly PosPaymentRow[],
  total: Money,
): Money {
  const paid = sumPaymentRows(rows);
  const missing = total.amount - paid.amount;
  return money(Math.max(0, missing), total.currency);
}

export function paymentChange(
  rows: readonly PosPaymentRow[],
  total: Money,
): Money {
  const paid = sumPaymentRows(rows);
  const change = paid.amount - total.amount;
  return money(Math.max(0, change), total.currency);
}

export function canConfirmCheckout(
  rows: readonly PosPaymentRow[],
  total: Money,
): boolean {
  if (rows.length === 0) {
    return false;
  }

  return (
    rows.every((row) => {
      if (!row.amountSoles.trim()) {
        return false;
      }
      return solesToMoney(row.amountSoles).amount > 0;
    }) && sumPaymentRows(rows).amount >= total.amount
  );
}

export function rowsToPaymentValues(
  rows: readonly PosPaymentRow[],
): PosPaymentValues[] {
  return rows
    .map((row) => ({
      method: row.method,
      amount: solesToMoney(row.amountSoles),
      ...(row.reference?.trim() ? { reference: row.reference.trim() } : {}),
    }))
    .filter((payment) => payment.amount.amount > 0);
}

export function defaultCashRow(total: PosTotals): PosPaymentRow {
  const soles = (total.total.amount / 100).toFixed(2);
  return createPaymentRow(PaymentMethod.Cash, soles);
}

export function formatDocumentLabel(ticket: {
  documentNumber?: string | undefined;
  code: string;
}): string {
  return ticket.documentNumber ?? ticket.code;
}

function centsToSoles(amount: number): string {
  return (amount / 100).toFixed(2);
}

/**
 * Filas iniciales del cobro según el método elegido en el POS.
 * - Anticipo: consume hasta el saldo disponible y completa en efectivo.
 * - Mixto: divide el total en efectivo + tarjeta.
 */
export function initialPaymentRows(
  method: PaymentMethod,
  total: Money,
  advanceBalance: Money = money(0),
): PosPaymentRow[] {
  if (method === PaymentMethod.Advance) {
    const fromAdvance = Math.min(advanceBalance.amount, total.amount);
    const rest = total.amount - fromAdvance;
    return [
      createPaymentRow(PaymentMethod.Advance, centsToSoles(fromAdvance)),
      ...(rest > 0
        ? [createPaymentRow(PaymentMethod.Cash, centsToSoles(rest))]
        : []),
    ];
  }

  if (method === PaymentMethod.Mixed) {
    const half = Math.round(total.amount / 2);
    return [
      createPaymentRow(PaymentMethod.Cash, centsToSoles(half)),
      createPaymentRow(PaymentMethod.Card, centsToSoles(total.amount - half)),
    ];
  }

  return [createPaymentRow(method, centsToSoles(total.amount))];
}

/** Monto de anticipo indicado en las filas que excede el saldo del cliente. */
export function advanceOverdraw(
  rows: readonly PosPaymentRow[],
  advanceBalance: Money,
): Money {
  const used = rows
    .filter((row) => row.method === PaymentMethod.Advance)
    .reduce((acc, row) => acc + solesToMoney(row.amountSoles).amount, 0);
  return money(Math.max(0, used - advanceBalance.amount));
}

/** Atajos de billetes para el efectivo recibido (montos en céntimos). */
export function cashTenderSuggestions(total: Money): Money[] {
  const amount = total.amount;
  if (amount <= 0) {
    return [];
  }
  const candidates = [
    amount,
    Math.ceil(amount / 1000) * 1000,
    Math.ceil(amount / 5000) * 5000,
    Math.ceil(amount / 10000) * 10000,
    Math.ceil(amount / 20000) * 20000,
  ];
  return [...new Set(candidates)].slice(0, 4).map((value) => money(value));
}
