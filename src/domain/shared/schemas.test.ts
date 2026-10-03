import { describe, expect, it } from "vitest";

import {
  dniSchema,
  emailSchema,
  isoDateSchema,
  moneySchema,
  paginationSchema,
  phoneSchema,
  plateSchema,
  rucSchema,
} from "@/domain/shared/schemas";

function firstError(result: { success: boolean; error?: unknown }): string {
  if (result.success || !result.error) {
    return "";
  }

  const issues = (result.error as { issues: { message: string }[] }).issues;
  return issues[0]?.message ?? "";
}

describe("plateSchema", () => {
  it("accepts the canonical dashboard plates", () => {
    for (const plate of ["ABC-123", "B4X-521", "F6T-884"]) {
      const result = plateSchema.safeParse(plate);
      expect(result.success).toBe(true);
    }
  });

  it("uppercases lowercase plates", () => {
    expect(plateSchema.parse("abc-123")).toBe("ABC-123");
  });

  it("rejects invalid plates with a Spanish message", () => {
    const result = plateSchema.safeParse("AB-12");
    expect(result.success).toBe(false);
    expect(firstError(result)).toContain("placa válida");
  });
});

describe("document schemas", () => {
  it("validates DNI and RUC", () => {
    expect(dniSchema.safeParse("45678912").success).toBe(true);
    expect(rucSchema.safeParse("20123456789").success).toBe(true);
    expect(firstError(dniSchema.safeParse("123"))).toContain("8 dígitos");
    expect(firstError(rucSchema.safeParse("123"))).toContain("11 dígitos");
  });
});

describe("contact schemas", () => {
  it("validates Peruvian mobile numbers", () => {
    expect(phoneSchema.safeParse("987654321").success).toBe(true);
    expect(phoneSchema.safeParse("+51987654321").success).toBe(true);
    expect(firstError(phoneSchema.safeParse("123456"))).toContain("celular");
  });

  it("validates emails", () => {
    expect(emailSchema.safeParse("lucia@4ruedas.pe").success).toBe(true);
    expect(firstError(emailSchema.safeParse("no-es-correo"))).toContain(
      "correo",
    );
  });
});

describe("moneySchema", () => {
  it("accepts integer cents in PEN", () => {
    expect(
      moneySchema.safeParse({ amount: 128000, currency: "PEN" }).success,
    ).toBe(true);
  });

  it("rejects decimals and other currencies", () => {
    expect(
      firstError(moneySchema.safeParse({ amount: 12.5, currency: "PEN" })),
    ).toContain("céntimos");
    expect(
      firstError(moneySchema.safeParse({ amount: 128000, currency: "USD" })),
    ).toContain("PEN");
  });
});

describe("isoDateSchema", () => {
  it("accepts ISO datetimes with offset", () => {
    expect(isoDateSchema.safeParse("2026-09-25T12:00:00-05:00").success).toBe(
      true,
    );
    expect(firstError(isoDateSchema.safeParse("25/09/2026"))).toContain("ISO");
  });
});

describe("paginationSchema", () => {
  it("accepts valid pagination", () => {
    const result = paginationSchema.safeParse({
      page: 1,
      pageSize: 20,
      total: 42,
      totalPages: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive pages", () => {
    const result = paginationSchema.safeParse({
      page: 0,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    });
    expect(firstError(result)).toContain("mayor o igual a 1");
  });
});
