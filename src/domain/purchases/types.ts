import type { DateTimeIso, EntityId, Money } from "@/domain/shared";

export enum PurchaseStatus {
  Draft = "draft",
  Sent = "sent",
  Received = "received",
  Cancelled = "cancelled",
}

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  [PurchaseStatus.Draft]: "Borrador",
  [PurchaseStatus.Sent]: "Enviada",
  [PurchaseStatus.Received]: "Recibida",
  [PurchaseStatus.Cancelled]: "Cancelada",
};

export type PurchaseLine = {
  readonly id: EntityId;
  readonly productId?: EntityId | undefined;
  readonly description: string;
  readonly quantity: number;
  readonly unitCost: Money;
  readonly discount?: Money | undefined;
  readonly igvRate: number;
};

export type PurchaseTotals = {
  readonly subtotal: Money;
  readonly discount: Money;
  readonly igv: Money;
  readonly total: Money;
};

export type Purchase = {
  readonly id: EntityId;
  readonly code: string;
  readonly supplierId: EntityId;
  readonly branchId: EntityId;
  readonly status: PurchaseStatus;
  readonly lines: readonly PurchaseLine[];
  readonly invoiceNumber?: string | undefined;
  readonly totals: PurchaseTotals;
  readonly purchasedAt?: DateTimeIso | undefined;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type PurchaseOrder = {
  readonly id: EntityId;
  readonly code: string;
  readonly supplierId: EntityId;
  readonly branchId: EntityId;
  readonly status: PurchaseStatus;
  readonly lines: readonly PurchaseLine[];
  readonly totals: PurchaseTotals;
  readonly expectedAt?: DateTimeIso | undefined;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type Quote = {
  readonly id: EntityId;
  readonly code: string;
  readonly supplierId: EntityId;
  readonly branchId: EntityId;
  readonly status: PurchaseStatus;
  readonly lines: readonly PurchaseLine[];
  readonly totals: PurchaseTotals;
  readonly validUntil?: DateTimeIso | undefined;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export enum ExpenseCategory {
  Maintenance = "maintenance",
  Utilities = "utilities",
  Rent = "rent",
  Supplies = "supplies",
  Services = "services",
  Other = "other",
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Maintenance]: "Mantenimiento",
  [ExpenseCategory.Utilities]: "Servicios básicos",
  [ExpenseCategory.Rent]: "Alquiler",
  [ExpenseCategory.Supplies]: "Suministros",
  [ExpenseCategory.Services]: "Servicios de terceros",
  [ExpenseCategory.Other]: "Otros",
};

export type Expense = {
  readonly id: EntityId;
  readonly code: string;
  readonly supplierId?: EntityId | undefined;
  readonly branchId: EntityId;
  readonly category: ExpenseCategory;
  readonly description: string;
  readonly amount: Money;
  readonly igv: Money;
  readonly total: Money;
  readonly incurredAt: DateTimeIso;
  readonly documentNumber?: string | undefined;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export function buildPurchaseCode(
  prefix: string,
  year: number,
  sequence: number,
): string {
  return `${prefix}-${year}-${String(sequence).padStart(4, "0")}`;
}
