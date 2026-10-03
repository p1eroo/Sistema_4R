import { beforeEach, describe, expect, it } from "vitest";

import { ProductStatus, ProductUnit } from "@/domain/products";
import { asEntityId, money } from "@/domain/shared";
import {
  ProductNotFoundError,
  ProductValidationError,
  createProductService,
  type ProductService,
} from "@/mocks/products/service";

const NEW_PRODUCT = {
  sku: "flt-comb-01",
  name: "Filtro de combustible",
  brand: "Wega",
  unit: ProductUnit.Unit,
  price: money(6000),
  stock: 10,
  minStock: 4,
};

let service: ProductService;

beforeEach(() => {
  service = createProductService();
});

describe("productService reads", () => {
  it("lists critical stock including brake pads", async () => {
    const critical = await service.listCriticalStock({ pageSize: 100 });
    const criticalNames = critical.items.map((product) => product.name);

    expect(criticalNames).toContain("Pastillas de freno delanteras");
    expect(criticalNames).toContain("Filtro de aceite");
    expect(criticalNames).toContain("Bujías NGK");

    const all = await service.list({ pageSize: 100 });
    const allNames = all.items.map((product) => product.name);
    expect(allNames).toContain("Aceite 5W30");
  });

  it("gets by SKU ignoring case", async () => {
    const product = await service.getBySku("pas-fre-01");

    expect(product?.name).toBe("Pastillas de freno delanteras");
    expect(product?.stock).toBe(2);
  });
});

describe("productService writes", () => {
  it("creates a product normalizing the SKU", async () => {
    const created = await service.create(NEW_PRODUCT);

    expect(created.id).toBe("PRD-0007");
    expect(created.sku).toBe("FLT-COMB-01");
    expect(created.status).toBe(ProductStatus.Active);
  });

  it("rejects a duplicate SKU", async () => {
    await expect(
      service.create({ ...NEW_PRODUCT, sku: "PAS-FRE-01" }),
    ).rejects.toBeInstanceOf(ProductValidationError);
  });

  it("updates stock and archives", async () => {
    const updated = await service.update(asEntityId("PRD-0002"), { stock: 12 });
    expect(updated.stock).toBe(12);

    const archived = await service.archive(asEntityId("PRD-0002"));
    expect(archived.status).toBe(ProductStatus.Inactive);

    await expect(
      service.archive(asEntityId("PRD-9999")),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
  });
});
