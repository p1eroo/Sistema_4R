import { beforeEach, describe, expect, it } from "vitest";

import { asEntityId } from "@/domain/shared";
import { FuelType } from "@/domain/vehicles/types";
import {
  VehicleNotFoundError,
  VehicleValidationError,
  createVehicleService,
  type VehicleService,
} from "@/mocks/vehicles/service";

const NEW_VEHICLE = {
  customerId: asEntityId("CUS-0001"),
  plate: "T9Z-100",
  brand: "Mazda",
  model: "CX-5",
  year: 2022,
  color: "Rojo",
  fuelType: FuelType.Gasolina,
  odometerKm: 12000,
};

let service: VehicleService;

beforeEach(() => {
  service = createVehicleService();
});

describe("vehicleService.list", () => {
  it("returns the seeded vehicles", async () => {
    const result = await service.list();

    expect(result.items).toHaveLength(12);
    expect(result.pagination.total).toBe(12);
  });
});

describe("vehicleService lookups", () => {
  it("gets by id", async () => {
    const vehicle = await service.getById(asEntityId("VEH-0001"));

    expect(vehicle?.plate).toBe("ABC-123");
  });

  it("gets by plate ignoring case", async () => {
    const vehicle = await service.getByPlate("abc-123");

    expect(vehicle?.brand).toBe("Toyota");
  });

  it("lists vehicles of a customer", async () => {
    const result = await service.listByCustomer(asEntityId("CUS-0001"));

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.plate).toBe("ABC-123");
  });
});

describe("vehicleService.create", () => {
  it("creates a vehicle with a generated id", async () => {
    const created = await service.create(NEW_VEHICLE);

    expect(created.id).toBe("VEH-0013");
    expect(created.plate).toBe("T9Z-100");
    expect((await service.list()).pagination.total).toBe(13);
  });

  it("rejects a duplicate plate", async () => {
    await expect(
      service.create({ ...NEW_VEHICLE, plate: "ABC-123" }),
    ).rejects.toBeInstanceOf(VehicleValidationError);
  });

  it("rejects invalid payloads", async () => {
    await expect(
      service.create({ ...NEW_VEHICLE, plate: "AB-1" }),
    ).rejects.toBeInstanceOf(VehicleValidationError);
  });
});

describe("vehicleService.update", () => {
  it("updates fields without changing the id", async () => {
    const updated = await service.update(asEntityId("VEH-0002"), {
      odometerKm: 33000,
    });

    expect(updated.id).toBe("VEH-0002");
    expect(updated.odometerKm).toBe(33000);
  });

  it("rejects changing to an existing plate", async () => {
    await expect(
      service.update(asEntityId("VEH-0002"), { plate: "ABC-123" }),
    ).rejects.toBeInstanceOf(VehicleValidationError);
  });

  it("rejects unknown ids", async () => {
    await expect(
      service.update(asEntityId("VEH-9999"), { color: "Verde" }),
    ).rejects.toBeInstanceOf(VehicleNotFoundError);
  });
});
