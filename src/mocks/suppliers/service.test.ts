import { beforeEach, describe, expect, it } from "vitest";

import { PaymentTerms, SupplierStatus } from "@/domain/suppliers";
import { asEntityId } from "@/domain/shared";
import {
  SupplierNotFoundError,
  SupplierValidationError,
  createSupplierService,
  type SupplierService,
} from "@/mocks/suppliers/service";

const NEW_SUPPLIER = {
  ruc: "20778899001",
  businessName: "Filtros del Pacífico SAC",
  tradeName: "Filtros del Pacífico",
  paymentTerms: PaymentTerms.Days30,
};

let service: SupplierService;

beforeEach(() => {
  service = createSupplierService();
});

describe("supplierService reads", () => {
  it("seeds the suppliers", async () => {
    const result = await service.list({ pageSize: 100 });

    expect(result.pagination.total).toBe(6);
  });

  it("gets by RUC", async () => {
    const supplier = await service.getByRuc("20512345678");

    expect(supplier?.businessName).toBe("Repuestos del Norte SAC");
  });
});

describe("supplierService writes", () => {
  it("creates a supplier", async () => {
    const created = await service.create(NEW_SUPPLIER);

    expect(created.id).toBe("SUP-0007");
    expect(created.status).toBe(SupplierStatus.Active);
  });

  it("rejects an invalid RUC", async () => {
    await expect(
      service.create({ ...NEW_SUPPLIER, ruc: "123" }),
    ).rejects.toBeInstanceOf(SupplierValidationError);
  });

  it("rejects a duplicate RUC", async () => {
    await expect(
      service.create({ ...NEW_SUPPLIER, ruc: "20512345678" }),
    ).rejects.toBeInstanceOf(SupplierValidationError);
  });

  it("updates and archives a supplier", async () => {
    const updated = await service.update(asEntityId("SUP-0002"), {
      tradeName: "Lubricantes del Perú",
    });
    expect(updated.tradeName).toBe("Lubricantes del Perú");

    const archived = await service.archive(asEntityId("SUP-0002"));
    expect(archived.status).toBe(SupplierStatus.Inactive);

    await expect(
      service.archive(asEntityId("SUP-9999")),
    ).rejects.toBeInstanceOf(SupplierNotFoundError);
  });
});
