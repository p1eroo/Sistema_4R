import { describe, expect, it } from "vitest";

import { customerSeed } from "@/mocks/customers/seed";
import { vehicleSeed } from "@/mocks/vehicles/seed";

describe("vehicleSeed", () => {
  it("seeds between 8 and 15 vehicles", () => {
    expect(vehicleSeed.length).toBeGreaterThanOrEqual(8);
    expect(vehicleSeed.length).toBeLessThanOrEqual(15);
  });

  it("includes the dashboard plates", () => {
    const plates = vehicleSeed.map((vehicle) => vehicle.plate);

    for (const plate of ["ABC-123", "B4X-521", "F6T-884"]) {
      expect(plates).toContain(plate);
    }
  });

  it("has unique ids and plates", () => {
    const ids = new Set(vehicleSeed.map((vehicle) => vehicle.id));
    const plates = new Set(vehicleSeed.map((vehicle) => vehicle.plate));

    expect(ids.size).toBe(vehicleSeed.length);
    expect(plates.size).toBe(vehicleSeed.length);
  });

  it("links every vehicle to an existing customer", () => {
    const customerIds = new Set(customerSeed.map((customer) => customer.id));

    for (const vehicle of vehicleSeed) {
      expect(customerIds.has(vehicle.customerId)).toBe(true);
    }
  });
});
