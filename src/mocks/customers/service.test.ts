import { beforeEach, describe, expect, it } from "vitest";

import {
  CustomerStatus,
  CustomerType,
  DocumentType,
} from "@/domain/customers/types";
import { asEntityId } from "@/domain/shared";
import {
  CustomerNotFoundError,
  CustomerValidationError,
  createCustomerService,
  type CustomerService,
} from "@/mocks/customers/service";

const NEW_PERSON = {
  type: CustomerType.Persona,
  documentType: DocumentType.DNI,
  documentNumber: "40123456",
  firstName: "Diego",
  lastName: "Núñez",
  phones: [{ label: "Móvil", number: "988777666" }],
  email: "diego.nunez@correo.pe",
};

let service: CustomerService;

beforeEach(() => {
  service = createCustomerService();
});

describe("customerService.list", () => {
  it("returns the seeded customers with pagination", async () => {
    const result = await service.list();

    expect(result.items).toHaveLength(12);
    expect(result.pagination.total).toBe(12);
  });

  it("filters by search term", async () => {
    const result = await service.list({ search: "lucía" });

    expect(result.items.map((customer) => customer.displayName)).toEqual([
      "Lucía Ramos",
    ]);
  });
});

describe("customerService.getById", () => {
  it("returns a customer by id", async () => {
    const customer = await service.getById(asEntityId("CUS-0001"));

    expect(customer?.displayName).toBe("Lucía Ramos");
  });
});

describe("customerService.create", () => {
  it("creates a customer with a generated stable id", async () => {
    const created = await service.create(NEW_PERSON);

    expect(created.id).toBe("CUS-0013");
    expect(created.displayName).toBe("Diego Núñez");
    expect(created.status).toBe(CustomerStatus.Active);
    expect((await service.list()).pagination.total).toBe(13);
  });

  it("rejects invalid payloads", async () => {
    await expect(
      service.create({ ...NEW_PERSON, email: "no-es-correo" }),
    ).rejects.toBeInstanceOf(CustomerValidationError);
  });
});

describe("customerService.update", () => {
  it("updates fields and recomputes the display name", async () => {
    const updated = await service.update(asEntityId("CUS-0001"), {
      lastName: "Ramos Díaz",
    });

    expect(updated.displayName).toBe("Lucía Ramos Díaz");
    expect(updated.id).toBe("CUS-0001");
  });

  it("rejects unknown ids", async () => {
    await expect(
      service.update(asEntityId("CUS-9999"), { notes: "x" }),
    ).rejects.toBeInstanceOf(CustomerNotFoundError);
  });
});

describe("customerService.archive", () => {
  it("marks the customer as archived", async () => {
    const archived = await service.archive(asEntityId("CUS-0002"));

    expect(archived.status).toBe(CustomerStatus.Archived);
    await expect(
      service.archive(asEntityId("CUS-9999")),
    ).rejects.toBeInstanceOf(CustomerNotFoundError);
  });
});

describe("customerService.searchByDocOrName", () => {
  it("finds by document number", async () => {
    const result = await service.searchByDocOrName("45678912");

    expect(result.items.map((customer) => customer.id)).toContain("CUS-0001");
  });

  it("finds by partial name", async () => {
    const result = await service.searchByDocOrName("rosa");

    expect(result.items.map((customer) => customer.displayName)).toContain(
      "Rosa Huamán",
    );
  });
});
