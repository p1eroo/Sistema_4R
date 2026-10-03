import { describe, expect, it } from "vitest";

import { asEntityId } from "@/domain/shared";
import {
  MAX_VEHICLE_YEAR,
  MIN_VEHICLE_YEAR,
  vehicleCreateSchema,
  vehicleUpdateSchema,
} from "@/domain/vehicles/schemas";
import { FuelType } from "@/domain/vehicles/types";

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

const validVehicle = {
  customerId: asEntityId("CUS-0001"),
  plate: "abc-123",
  brand: "Toyota",
  model: "Corolla",
  year: 2021,
  color: "Blanco",
  fuelType: FuelType.Gasolina,
  odometerKm: 45000,
};

describe("vehicleCreateSchema", () => {
  it("accepts a valid vehicle and normalizes the plate", () => {
    const result = vehicleCreateSchema.safeParse(validVehicle);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.plate).toBe("ABC-123");
    }
  });

  it("accepts the canonical dashboard plates", () => {
    for (const plate of ["ABC-123", "B4X-521", "F6T-884"]) {
      expect(
        vehicleCreateSchema.safeParse({ ...validVehicle, plate }).success,
      ).toBe(true);
    }
  });

  it("rejects an invalid plate", () => {
    const messages = errorMessages(
      vehicleCreateSchema.safeParse({ ...validVehicle, plate: "AB-12" }),
    );
    expect(messages.some((message) => message.includes("placa válida"))).toBe(
      true,
    );
  });

  it("rejects a year outside the allowed range", () => {
    const tooOld = errorMessages(
      vehicleCreateSchema.safeParse({
        ...validVehicle,
        year: MIN_VEHICLE_YEAR - 1,
      }),
    );
    expect(tooOld.some((message) => message.includes("menor"))).toBe(true);

    const tooNew = errorMessages(
      vehicleCreateSchema.safeParse({
        ...validVehicle,
        year: MAX_VEHICLE_YEAR + 1,
      }),
    );
    expect(tooNew.some((message) => message.includes("mayor"))).toBe(true);
  });

  it("rejects a missing brand and negative odometer", () => {
    const messages = errorMessages(
      vehicleCreateSchema.safeParse({
        ...validVehicle,
        brand: "",
        odometerKm: -1,
      }),
    );
    expect(messages.some((message) => message.includes("marca"))).toBe(true);
    expect(messages.some((message) => message.includes("negativo"))).toBe(true);
  });

  it("rejects a malformed VIN", () => {
    const messages = errorMessages(
      vehicleCreateSchema.safeParse({ ...validVehicle, vin: "123" }),
    );
    expect(messages.some((message) => message.includes("VIN"))).toBe(true);
  });
});

describe("vehicleUpdateSchema", () => {
  it("accepts a partial update", () => {
    const result = vehicleUpdateSchema.safeParse({ odometerKm: 52000 });

    expect(result.success).toBe(true);
  });
});
