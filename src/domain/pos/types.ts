import type { DateTimeIso, EntityId, Money } from "@/domain/shared";
import { money, PEN } from "@/domain/shared";

export const POS_IGV_RATE = 0.18;

export enum PosLineKind {
  Product = "product",
  Service = "service",
  Other = "other",
}

export const POS_LINE_KIND_LABELS: Record<PosLineKind, string> = {
  [PosLineKind.Product]: "Producto",
  [PosLineKind.Service]: "Servicio",
  [PosLineKind.Other]: "Otro",
};

export enum PaymentMethod {
  Cash = "cash",
  Card = "card",
  Yape = "yape",
  Plin = "plin",
  Transfer = "transfer",
  Advance = "advance",
  Mixed = "mixed",
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: "Efectivo",
  [PaymentMethod.Card]: "Tarjeta",
  [PaymentMethod.Yape]: "Yape",
  [PaymentMethod.Plin]: "Plin",
  [PaymentMethod.Transfer]: "Transferencia",
  [PaymentMethod.Advance]: "Anticipo",
  [PaymentMethod.Mixed]: "Mixto",
};

export enum PosStatus {
  Draft = "draft",
  PendingPayment = "pending_payment",
  OnHold = "on_hold",
  Paid = "paid",
  Cancelled = "cancelled",
  Refunded = "refunded",
}

export const POS_STATUS_LABELS: Record<PosStatus, string> = {
  [PosStatus.Draft]: "Borrador",
  [PosStatus.PendingPayment]: "Pendiente de pago",
  [PosStatus.OnHold]: "En espera",
  [PosStatus.Paid]: "Pagado",
  [PosStatus.Cancelled]: "Cancelado",
  [PosStatus.Refunded]: "Reembolsado",
};

export type PosLine = {
  readonly id: EntityId;
  readonly kind: PosLineKind;
  readonly productId?: EntityId | undefined;
  readonly serviceId?: EntityId | undefined;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly discount?: Money | undefined;
  readonly igvRate: number;
};

export type PosPayment = {
  readonly id: EntityId;
  readonly method: PaymentMethod;
  readonly amount: Money;
  readonly reference?: string | undefined;
};

export type PosTotals = {
  readonly subtotal: Money;
  readonly discount: Money;
  readonly igv: Money;
  /** Ajuste por redondeo a favor del cliente (siempre <= 0). */
  readonly rounding?: Money | undefined;
  readonly total: Money;
};

export type PosTicket = {
  readonly id: EntityId;
  readonly code: string;
  readonly documentNumber?: string | undefined;
  readonly customerId?: EntityId | undefined;
  readonly branchId: EntityId;
  readonly cashierId?: EntityId | undefined;
  readonly status: PosStatus;
  readonly lines: readonly PosLine[];
  readonly payments: readonly PosPayment[];
  readonly totals: PosTotals;
  readonly paidAmount: Money;
  readonly change: Money;
  readonly globalDiscount?: Money | undefined;
  readonly roundTotal?: boolean | undefined;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type PosTicketListItem = {
  readonly id: EntityId;
  readonly code: string;
  readonly status: PosStatus;
  readonly total: Money;
  readonly itemCount: number;
  readonly createdAt: DateTimeIso;
};

export type PosTotalsLine = {
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly discount?: Money | undefined;
};

/** Redondeo de mostrador: baja el total al múltiplo de S/ 0.10 inferior. */
export const POS_ROUNDING_STEP = 10;

export function calculatePosTotals(
  lines: readonly PosTotalsLine[],
  globalDiscount?: Money,
  options: { roundTotal?: boolean | undefined } = {},
): PosTotals {
  const currency = lines[0]?.unitPrice.currency ?? PEN;
  const subtotal = lines.reduce(
    (acc, line) => acc + line.quantity * line.unitPrice.amount,
    0,
  );
  const discount = Math.min(
    subtotal,
    lines.reduce((acc, line) => acc + (line.discount?.amount ?? 0), 0) +
      (globalDiscount?.amount ?? 0),
  );
  const taxable = subtotal - discount;
  const igv = Math.round(taxable * POS_IGV_RATE);
  const gross = taxable + igv;
  const remainder = gross % POS_ROUNDING_STEP;
  const rounding = options.roundTotal && remainder > 0 ? -remainder : 0;

  return {
    subtotal: money(subtotal, currency),
    discount: money(discount, currency),
    igv: money(igv, currency),
    ...(options.roundTotal ? { rounding: money(rounding, currency) } : {}),
    total: money(gross + rounding, currency),
  };
}

export function sumPayments(payments: readonly PosPayment[]): Money {
  const currency = payments[0]?.amount.currency ?? PEN;
  return payments.reduce(
    (acc, payment) => money(acc.amount + payment.amount.amount, currency),
    money(0, currency),
  );
}
