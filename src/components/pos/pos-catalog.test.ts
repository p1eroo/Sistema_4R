import { describe, expect, it } from "vitest";

import {
  buildPosCatalog,
  catalogItemToLine,
  findCatalogBySku,
} from "@/components/pos/pos-catalog";
import { PosLineKind } from "@/domain/pos";
import { ProductStatus, ProductUnit } from "@/domain/products";
import { ServiceCategory, ServiceStatus } from "@/domain/services";
import { asEntityId, money } from "@/domain/shared";

const oil = {
  id: asEntityId("PRD-0004"),
  sku: "ACE-5W30-01",
  name: "Aceite 5W30",
  unit: ProductUnit.Liter,
  price: money(8000),
  igvRate: 0.18,
  stock: 24,
  minStock: 12,
  status: ProductStatus.Active,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const oilChange = {
  id: asEntityId("SRV-0002"),
  code: "SRV-002",
  name: "Cambio de aceite",
  category: ServiceCategory.Maintenance,
  estimatedMinutes: 60,
  price: money(9000),
  igvRate: 0.18,
  status: ServiceStatus.Active,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("findCatalogBySku", () => {
  it("adds the oil SKU as a product line", () => {
    const catalog = buildPosCatalog([oil], [oilChange]);
    const match = findCatalogBySku(catalog, "ace-5w30-01");

    expect(match?.name).toBe("Aceite 5W30");
    expect(catalogItemToLine(match!)).toMatchObject({
      kind: PosLineKind.Product,
      productId: "PRD-0004",
      quantity: 1,
      unitPrice: money(8000),
    });
  });
});
