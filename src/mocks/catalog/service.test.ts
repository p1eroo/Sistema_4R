import { describe, expect, it } from "vitest";

import { CatalogStatus } from "@/domain/catalog";
import { asEntityId } from "@/domain/shared";
import {
  CatalogNotFoundError,
  CatalogValidationError,
  brandService,
  categoryService,
  lineService,
} from "@/mocks/catalog/service";

describe("catalog taxonomy seeds", () => {
  it("has categories and brands", async () => {
    const categories = await categoryService.list({ pageSize: 100 });
    const brands = await brandService.list({ pageSize: 100 });

    expect(categories.pagination.total).toBeGreaterThanOrEqual(5);
    expect(brands.pagination.total).toBeGreaterThanOrEqual(6);
  });

  it("finds brands by code ignoring case", async () => {
    const brand = await brandService.getByCode("ngk");

    expect(brand?.name).toBe("NGK");
  });
});

describe("catalog taxonomy writes", () => {
  it("creates a category normalizing the code", async () => {
    const created = await categoryService.create({
      code: "luces",
      name: "Luces",
    });

    expect(created.id).toBe("CAT-0006");
    expect(created.code).toBe("LUCES");
    expect(created.status).toBe(CatalogStatus.Active);
  });

  it("rejects a duplicate code", async () => {
    await expect(
      categoryService.create({ code: "FRENOS", name: "Frenos 2" }),
    ).rejects.toBeInstanceOf(CatalogValidationError);
  });

  it("creates and archives lines linked to brand and category", async () => {
    const created = await lineService.create({
      code: "FLT-NGK",
      name: "Filtros NGK",
      brandId: asEntityId("BRD-0001"),
      categoryId: asEntityId("CAT-0002"),
    });

    expect(created.id).toBe("LIN-0006");
    expect(created.brandId).toBe("BRD-0001");

    const archived = await lineService.archive(asEntityId("LIN-0001"));
    expect(archived.status).toBe(CatalogStatus.Inactive);

    await expect(
      categoryService.archive(asEntityId("CAT-9999")),
    ).rejects.toBeInstanceOf(CatalogNotFoundError);
  });
});
