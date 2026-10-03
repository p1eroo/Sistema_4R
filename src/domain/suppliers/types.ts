import type { DateTimeIso, EntityId } from "@/domain/shared";

export enum SupplierStatus {
  Active = "active",
  Inactive = "inactive",
}

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  [SupplierStatus.Active]: "Activo",
  [SupplierStatus.Inactive]: "Inactivo",
};

export enum PaymentTerms {
  Cash = "cash",
  Days15 = "days_15",
  Days30 = "days_30",
  Days45 = "days_45",
  Days60 = "days_60",
}

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  [PaymentTerms.Cash]: "Contado",
  [PaymentTerms.Days15]: "15 días",
  [PaymentTerms.Days30]: "30 días",
  [PaymentTerms.Days45]: "45 días",
  [PaymentTerms.Days60]: "60 días",
};

export type SupplierContact = {
  readonly name: string;
  readonly role?: string | undefined;
  readonly phone?: string | undefined;
  readonly email?: string | undefined;
};

export type Supplier = {
  readonly id: EntityId;
  readonly ruc: string;
  readonly businessName: string;
  readonly tradeName?: string | undefined;
  readonly contact?: SupplierContact | undefined;
  readonly phone?: string | undefined;
  readonly email?: string | undefined;
  readonly address?: string | undefined;
  readonly paymentTerms: PaymentTerms;
  readonly status: SupplierStatus;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type SupplierListItem = {
  readonly id: EntityId;
  readonly ruc: string;
  readonly businessName: string;
  readonly tradeName?: string | undefined;
  readonly contactName?: string | undefined;
  readonly phone?: string | undefined;
  readonly paymentTerms: PaymentTerms;
  readonly status: SupplierStatus;
};
