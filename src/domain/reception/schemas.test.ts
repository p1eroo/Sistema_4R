import { describe, expect, it } from "vitest";

import {
  receptionCompleteSchema,
  receptionDraftSchema,
  receptionStepChecklistSchema,
} from "@/domain/reception/schemas";
import {
  createReceptionChecklist,
  FuelLevel,
  type ChecklistItem,
} from "@/domain/reception/types";
import { asEntityId } from "@/domain/shared";

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

const validParty = {
  customerId: asEntityId("CUS-0001"),
  vehicleId: asEntityId("VEH-0001"),
  branchId: asEntityId("BR-LM"),
  reason: "Mantenimiento preventivo",
};

const validChecklist = {
  odometerKm: 48250,
  fuelLevel: FuelLevel.Half,
  belongings: [
    { id: asEntityId("BEL-1"), label: "Llanta de repuesto", quantity: 1 },
  ],
  checklist: createReceptionChecklist(["documentos"]),
};

describe("receptionCompleteSchema", () => {
  it("accepts a complete reception", () => {
    const result = receptionCompleteSchema.safeParse({
      ...validParty,
      ...validChecklist,
    });

    expect(result.success).toBe(true);
  });

  it("requires customer and vehicle", () => {
    const withoutCustomer = errorMessages(
      receptionCompleteSchema.safeParse({ ...validChecklist }),
    );
    expect(withoutCustomer.length).toBeGreaterThan(0);
    expect(withoutCustomer.some((message) => message.includes("válida"))).toBe(
      true,
    );

    const withoutVehicle = errorMessages(
      receptionCompleteSchema.safeParse({
        ...validParty,
        vehicleId: undefined,
        ...validChecklist,
      }),
    );
    expect(withoutVehicle.length).toBeGreaterThan(0);
  });

  it("rejects a negative odometer and an empty reason", () => {
    const messages = errorMessages(
      receptionCompleteSchema.safeParse({
        ...validParty,
        ...validChecklist,
        reason: "",
        odometerKm: -1,
      }),
    );
    expect(messages.some((message) => message.includes("motivo"))).toBe(true);
    expect(messages.some((message) => message.includes("negativo"))).toBe(true);
  });

  it("rejects checklist items outside the catalog", () => {
    const checklist = [
      {
        id: "no-existe",
        label: "Inventado",
        checked: true,
      },
    ] as unknown as ChecklistItem[];

    const messages = errorMessages(
      receptionCompleteSchema.safeParse({
        ...validParty,
        ...validChecklist,
        checklist,
      }),
    );
    expect(messages.length).toBeGreaterThan(0);
  });
});

describe("step schemas", () => {
  it("parses the checklist step independently", () => {
    const result = receptionStepChecklistSchema.safeParse(validChecklist);

    expect(result.success).toBe(true);
  });
});

describe("receptionDraftSchema", () => {
  it("requires customer and vehicle but allows the rest empty", () => {
    const result = receptionDraftSchema.safeParse({
      customerId: asEntityId("CUS-0002"),
      vehicleId: asEntityId("VEH-0004"),
      branchId: asEntityId("BR-SU"),
    });

    expect(result.success).toBe(true);
  });
});
