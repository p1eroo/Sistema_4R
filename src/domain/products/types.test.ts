import { describe, expect, it } from "vitest";

import { productCreateSchema } from "@/domain/products/schemas";
import {
  isLowStock,
  PRODUCT_STATUS_LABELS,
  PRODUCT_UNIT_LABELS,
  ProductStatus,
  ProductUnit,
} from "@/domain/products/types";

function errorMessages(result: {
  success: boolean;
  error?: unknown;
}): string[] {
  if (result.success || !result.error) {
    return [];
  }

  const issues = (result.error as { issues: { message: string }[] }).issues;
  return issues.map((issue) => issue.message);
}

const validProduct = {
  sku: "flt-001",
  name: "Filtro de aceite",
  unit: ProductUnit.Unit,
  price: { amount: 4500, currency: "PEN" as const },
  stock: 4,
  minStock: 6,
};

describe("isLowStock", () => {
  it("detects stock at or below the minimum", () => {
    expect(isLowStock({ stock: 4, minStock: 6 })).toBe(true);
    expect(isLowStock({ stock: 6, minStock: 6 })).toBe(true);
    expect(isLowStock({ stock: 7, minStock: 6 })).toBe(false);
  });
});

describe("labels", () => {
  it("labels every unit and status", () => {
    for (const unit of Object.values(ProductUnit)) {
      expect(PRODUCT_UNIT_LABELS[unit]).toBeTruthy();
    }
    for (const status of Object.values(ProductStatus)) {
      expect(PRODUCT_STATUS_LABELS[status]).toBeTruthy();
    }
  });
});

describe("productCreateSchema", () => {
  it("accepts a valid product and uppercases the SKU", () => {
    const result = productCreateSchema.safeParse(validProduct);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sku).toBe("FLT-001");
    }
  });

  it("rejects a negative price", () => {
    const messages = errorMessages(
      productCreateSchema.safeParse({
        ...validProduct,
        price: { amount: -1, currency: "PEN" },
      }),
    );

    expect(messages.some((message) => message.includes("negativo"))).toBe(true);
  });

  it("rejects an invalid SKU and negative stock", () => {
    const messages = errorMessages(
      productCreateSchema.safeParse({ ...validProduct, sku: "a", stock: -1 }),
    );

    expect(messages.some((message) => message.includes("SKU"))).toBe(true);
    expect(messages.some((message) => message.includes("stock"))).toBe(true);
  });
});
