import { beforeEach, describe, expect, it } from "vitest";

import { ServiceCategory, ServiceStatus } from "@/domain/services";
import { asEntityId, money } from "@/domain/shared";
import {
  ServiceNotFoundError,
  ServiceValidationError,
  createServiceCatalog,
  type ServiceCatalog,
} from "@/mocks/services/service";

const NEW_SERVICE = {
  code: "srv-007",
  name: "Cambio de batería",
  category: ServiceCategory.Electrical,
  estimatedMinutes: 45,
  price: money(8000),
};

let catalog: ServiceCatalog;

beforeEach(() => {
  catalog = createServiceCatalog();
});

describe("serviceCatalog reads", () => {
  it("seeds the four dashboard ranking services", async () => {
    const result = await catalog.list({ pageSize: 100 });
    const names = result.items.map((service) => service.name);

    for (const name of [
      "Mantenimiento preventivo",
      "Cambio de aceite",
      "Sistema de frenos",
      "Diagnóstico computarizado",
    ]) {
      expect(names).toContain(name);
    }
  });

  it("gets by code ignoring case", async () => {
    const service = await catalog.getByCode("srv-001");

    expect(service?.name).toBe("Mantenimiento preventivo");
  });
});

describe("serviceCatalog writes", () => {
  it("creates a service normalizing the code", async () => {
    const created = await catalog.create(NEW_SERVICE);

    expect(created.id).toBe("SRV-0007");
    expect(created.code).toBe("SRV-007");
    expect(created.status).toBe(ServiceStatus.Active);
  });

  it("rejects a duplicate code and negative price", async () => {
    await expect(
      catalog.create({ ...NEW_SERVICE, code: "SRV-001" }),
    ).rejects.toBeInstanceOf(ServiceValidationError);

    await expect(
      catalog.create({ ...NEW_SERVICE, price: money(-1) }),
    ).rejects.toBeInstanceOf(ServiceValidationError);
  });

  it("updates and archives a service", async () => {
    const updated = await catalog.update(asEntityId("SRV-0002"), {
      price: money(9500),
    });
    expect(updated.price.amount).toBe(9500);

    const archived = await catalog.archive(asEntityId("SRV-0002"));
    expect(archived.status).toBe(ServiceStatus.Inactive);

    await expect(
      catalog.archive(asEntityId("SRV-9999")),
    ).rejects.toBeInstanceOf(ServiceNotFoundError);
  });
});
