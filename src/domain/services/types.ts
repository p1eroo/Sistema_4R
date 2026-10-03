import type { DateTimeIso, EntityId, Money } from "@/domain/shared";

export enum ServiceCategory {
  Maintenance = "maintenance",
  Mechanical = "mechanical",
  Electrical = "electrical",
  Diagnostics = "diagnostics",
  Bodywork = "bodywork",
  Other = "other",
}

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  [ServiceCategory.Maintenance]: "Mantenimiento",
  [ServiceCategory.Mechanical]: "Mecánica",
  [ServiceCategory.Electrical]: "Eléctrico",
  [ServiceCategory.Diagnostics]: "Diagnóstico",
  [ServiceCategory.Bodywork]: "Planchado y pintura",
  [ServiceCategory.Other]: "Otros",
};

export enum ServiceStatus {
  Active = "active",
  Inactive = "inactive",
}

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  [ServiceStatus.Active]: "Activo",
  [ServiceStatus.Inactive]: "Inactivo",
};

export type ServiceItem = {
  readonly id: EntityId;
  readonly code: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly category: ServiceCategory;
  readonly estimatedMinutes: number;
  readonly price: Money;
  readonly igvRate: number;
  readonly status: ServiceStatus;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type ServiceListItem = {
  readonly id: EntityId;
  readonly code: string;
  readonly name: string;
  readonly category: ServiceCategory;
  readonly estimatedMinutes: number;
  readonly price: Money;
  readonly status: ServiceStatus;
};
