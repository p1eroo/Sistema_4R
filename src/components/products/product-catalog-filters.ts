import { isLowStock, ProductUnit, type Product } from "@/domain/products";
import { asEntityId, type EntityId } from "@/domain/shared";

export type ProductListFilters = {
  readonly search: string;
  readonly categoryId: string;
  readonly brand: string;
};

export const EMPTY_PRODUCT_FILTERS: ProductListFilters = {
  search: "",
  categoryId: "all",
  brand: "all",
};

const SKU_CATEGORY_PREFIXES: readonly {
  readonly prefix: string;
  readonly categoryId: EntityId;
}[] = [
  { prefix: "PAS-", categoryId: asEntityId("CAT-0001") },
  { prefix: "LIQ-FRE", categoryId: asEntityId("CAT-0001") },
  { prefix: "FLT-", categoryId: asEntityId("CAT-0002") },
  { prefix: "ACE-", categoryId: asEntityId("CAT-0003") },
  { prefix: "BUJ-", categoryId: asEntityId("CAT-0004") },
];

export function inferProductCategoryId(
  product: Pick<Product, "sku" | "categoryId">,
): EntityId | undefined {
  if (product.categoryId) {
    return product.categoryId;
  }

  const sku = product.sku.trim().toUpperCase();
  return SKU_CATEGORY_PREFIXES.find((entry) => sku.startsWith(entry.prefix))
    ?.categoryId;
}

export function filterProducts(
  items: readonly Product[],
  filters: ProductListFilters,
): Product[] {
  const categoryId = filters.categoryId;
  const brand = filters.brand.trim().toLowerCase();

  return items.filter((product) => {
    if (categoryId !== "all") {
      const resolved = inferProductCategoryId(product);
      if (resolved !== categoryId) {
        return false;
      }
    }

    if (
      brand !== "all" &&
      (product.brand ?? "").trim().toLowerCase() !== brand
    ) {
      return false;
    }

    return true;
  });
}

export function productStockTone(
  product: Pick<Product, "stock" | "minStock">,
): "danger" | "warning" | "success" {
  if (!isLowStock(product)) {
    return "success";
  }

  const ratio = product.minStock === 0 ? 0 : product.stock / product.minStock;
  return ratio <= 0.25 ? "danger" : "warning";
}

export function productStockLabel(
  product: Pick<Product, "stock" | "minStock">,
): string {
  const tone = productStockTone(product);
  if (tone === "danger") {
    return "Crítico";
  }
  if (tone === "warning") {
    return "Bajo";
  }
  return "OK";
}

export function productStockQtyLabel(
  product: Pick<Product, "stock" | "unit">,
): string {
  if (
    product.unit === ProductUnit.Liter ||
    product.unit === ProductUnit.Gallon
  ) {
    return `${product.stock} L`;
  }

  return `${product.stock} und.`;
}

export function uniqueProductBrands(
  items: readonly Pick<Product, "brand">[],
): string[] {
  const brands = new Set<string>();
  for (const item of items) {
    const brand = item.brand?.trim();
    if (brand) {
      brands.add(brand);
    }
  }

  return [...brands].sort((left, right) => left.localeCompare(right, "es"));
}
