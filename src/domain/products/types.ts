import type { DateTimeIso, EntityId, Money } from "@/domain/shared";

export enum ProductStatus {
  Active = "active",
  Inactive = "inactive",
  Discontinued = "discontinued",
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.Active]: "Activo",
  [ProductStatus.Inactive]: "Inactivo",
  [ProductStatus.Discontinued]: "Descontinuado",
};

export enum ProductUnit {
  Unit = "unit",
  Liter = "liter",
  Gallon = "gallon",
  Kilogram = "kilogram",
  Set = "set",
  Box = "box",
}

export const PRODUCT_UNIT_LABELS: Record<ProductUnit, string> = {
  [ProductUnit.Unit]: "Unidad",
  [ProductUnit.Liter]: "Litro",
  [ProductUnit.Gallon]: "Galón",
  [ProductUnit.Kilogram]: "Kilogramo",
  [ProductUnit.Set]: "Juego",
  [ProductUnit.Box]: "Caja",
};

export type Product = {
  readonly id: EntityId;
  readonly sku: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly brand?: string | undefined;
  readonly categoryId?: EntityId | undefined;
  readonly unit: ProductUnit;
  readonly price: Money;
  readonly cost?: Money | undefined;
  readonly igvRate: number;
  readonly stock: number;
  readonly minStock: number;
  readonly location?: string | undefined;
  readonly status: ProductStatus;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type ProductListItem = {
  readonly id: EntityId;
  readonly sku: string;
  readonly name: string;
  readonly brand?: string | undefined;
  readonly unit: ProductUnit;
  readonly price: Money;
  readonly stock: number;
  readonly minStock: number;
  readonly isLowStock: boolean;
  readonly status: ProductStatus;
};

export function isLowStock(
  product: Pick<Product, "stock" | "minStock">,
): boolean {
  return product.stock <= product.minStock;
}
