import type { DateTimeIso, EntityId } from "@/domain/shared";

export enum CatalogStatus {
  Active = "active",
  Inactive = "inactive",
}

export const CATALOG_STATUS_LABELS: Record<CatalogStatus, string> = {
  [CatalogStatus.Active]: "Activo",
  [CatalogStatus.Inactive]: "Inactivo",
};

export type CatalogCategory = {
  readonly id: EntityId;
  readonly code: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly status: CatalogStatus;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type CatalogBrand = {
  readonly id: EntityId;
  readonly code: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly status: CatalogStatus;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type CatalogLine = {
  readonly id: EntityId;
  readonly code: string;
  readonly name: string;
  readonly brandId?: EntityId | undefined;
  readonly categoryId?: EntityId | undefined;
  readonly status: CatalogStatus;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type CatalogNamedEntity = {
  readonly id: EntityId;
  readonly code: string;
  readonly name: string;
  readonly status: CatalogStatus;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};
