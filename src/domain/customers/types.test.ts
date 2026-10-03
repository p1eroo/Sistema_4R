import { describe, expect, it } from "vitest";

import { CustomerType, customerDisplayName } from "@/domain/customers";

describe("customerDisplayName", () => {
  it("joins first and last name for people", () => {
    expect(
      customerDisplayName({
        type: CustomerType.Persona,
        firstName: "Lucía",
        lastName: "Ramos",
      }),
    ).toBe("Lucía Ramos");
  });

  it("uses the business name for companies", () => {
    expect(
      customerDisplayName({
        type: CustomerType.Empresa,
        businessName: "Taller El Sol SAC",
      }),
    ).toBe("Taller El Sol SAC");
  });

  it("falls back when required name parts are missing", () => {
    expect(customerDisplayName({ type: CustomerType.Persona })).toBe(
      "Cliente sin nombre",
    );
    expect(
      customerDisplayName({ type: CustomerType.Empresa, businessName: "  " }),
    ).toBe("Empresa sin nombre");
  });
});
