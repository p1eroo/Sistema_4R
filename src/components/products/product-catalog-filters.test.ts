import { describe, expect, it } from "vitest";

import {
  EMPTY_PRODUCT_FILTERS,
  filterProducts,
  inferProductCategoryId,
  productStockQtyLabel,
  productStockTone,
  uniqueProductBrands,
} from "@/components/products/product-catalog-filters";
import { productSeed } from "@/mocks/products/seed";

function bySku(sku: string) {
  const found = productSeed.find((product) => product.sku === sku);
  if (!found) {
    throw new Error(`Seed missing ${sku}`);
  }
  return found;
}

describe("product catalog filters", () => {
  it("infers seed categories from SKU prefixes", () => {
    expect(inferProductCategoryId(bySku("PAS-FRE-01"))).toBe("CAT-0001");
    expect(inferProductCategoryId(bySku("LIQ-FRE-01"))).toBe("CAT-0001");
    expect(inferProductCategoryId(bySku("FLT-ACE-01"))).toBe("CAT-0002");
    expect(inferProductCategoryId(bySku("ACE-5W30-01"))).toBe("CAT-0003");
    expect(inferProductCategoryId(bySku("BUJ-NGK-01"))).toBe("CAT-0004");
  });

  it("filters seed by frenos and Bosch", () => {
    const frenos = filterProducts(productSeed, {
      ...EMPTY_PRODUCT_FILTERS,
      categoryId: "CAT-0001",
    });
    expect(frenos.map((product) => product.sku)).toEqual([
      "PAS-FRE-01",
      "LIQ-FRE-01",
    ]);

    const bosch = filterProducts(productSeed, {
      ...EMPTY_PRODUCT_FILTERS,
      brand: "Bosch",
    });
    expect(bosch.map((product) => product.name)).toEqual([
      "Pastillas de freno delanteras",
      "Líquido de frenos DOT4",
    ]);
  });

  it("matches dashboard stock emphasis for pastillas", () => {
    expect(productStockTone(bySku("PAS-FRE-01"))).toBe("danger");
    expect(productStockTone(bySku("FLT-ACE-01"))).toBe("warning");
    expect(productStockTone(bySku("BUJ-NGK-01"))).toBe("warning");
    expect(productStockTone(bySku("ACE-5W30-01"))).toBe("success");
    expect(productStockQtyLabel(bySku("PAS-FRE-01"))).toBe("2 und.");
  });

  it("lists unique brands from the seed", () => {
    expect(uniqueProductBrands(productSeed)).toEqual([
      "Bosch",
      "Mobil",
      "NGK",
      "Wega",
    ]);
  });
});
