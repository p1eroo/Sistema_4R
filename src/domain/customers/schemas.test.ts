import { describe, expect, it } from "vitest";

import {
  customerCreateSchema,
  customerUpdateSchema,
} from "@/domain/customers/schemas";
import { CustomerType, DocumentType } from "@/domain/customers/types";

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

const validPersona = {
  type: CustomerType.Persona,
  documentType: DocumentType.DNI,
  documentNumber: "45678912",
  firstName: "Lucía",
  lastName: "Ramos",
  phones: [{ label: "Móvil", number: "987654321" }],
  email: "lucia@4ruedas.pe",
};

describe("customerCreateSchema", () => {
  it("accepts a valid person", () => {
    const result = customerCreateSchema.safeParse(validPersona);
    expect(result.success).toBe(true);
  });

  it("accepts a valid company with RUC", () => {
    const result = customerCreateSchema.safeParse({
      type: CustomerType.Empresa,
      documentType: DocumentType.RUC,
      documentNumber: "20123456789",
      businessName: "Taller El Sol SAC",
      phones: [{ label: "Central", number: "+51987654321" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid DNI", () => {
    const messages = errorMessages(
      customerCreateSchema.safeParse({
        ...validPersona,
        documentNumber: "123",
      }),
    );
    expect(messages.some((message) => message.includes("8 dígitos"))).toBe(
      true,
    );
  });

  it("rejects a person without last name", () => {
    const { lastName: _lastName, ...withoutLastName } = validPersona;
    const messages = errorMessages(
      customerCreateSchema.safeParse(withoutLastName),
    );
    expect(messages).toContain("El apellido es obligatorio.");
  });

  it("rejects a company without business name", () => {
    const messages = errorMessages(
      customerCreateSchema.safeParse({
        type: CustomerType.Empresa,
        documentType: DocumentType.RUC,
        documentNumber: "20123456789",
        phones: [{ label: "Central", number: "987654321" }],
      }),
    );
    expect(messages).toContain("La razón social es obligatoria.");
  });

  it("rejects a company documented with DNI", () => {
    const messages = errorMessages(
      customerCreateSchema.safeParse({
        type: CustomerType.Empresa,
        documentType: DocumentType.DNI,
        documentNumber: "45678912",
        businessName: "Taller El Sol SAC",
        phones: [{ label: "Central", number: "987654321" }],
      }),
    );
    expect(messages).toContain("Para empresas el documento debe ser RUC.");
  });

  it("requires at least one phone and a valid number", () => {
    const noPhones = errorMessages(
      customerCreateSchema.safeParse({ ...validPersona, phones: [] }),
    );
    expect(noPhones).toContain("Registra al menos un teléfono.");

    const badPhone = errorMessages(
      customerCreateSchema.safeParse({
        ...validPersona,
        phones: [{ label: "Móvil", number: "123" }],
      }),
    );
    expect(badPhone.some((message) => message.includes("celular"))).toBe(true);
  });
});

describe("customerUpdateSchema", () => {
  it("accepts a partial update", () => {
    const result = customerUpdateSchema.safeParse({
      notes: "Cliente frecuente",
    });
    expect(result.success).toBe(true);
  });
});
