import { describe, expect, it } from "vitest";

import { vehicleDisplayName } from "@/domain/vehicles";

describe("vehicleDisplayName", () => {
  it("combines brand, model, year and plate", () => {
    expect(
      vehicleDisplayName({
        brand: "Toyota",
        model: "Corolla",
        year: 2021,
        plate: "ABC-123",
      }),
    ).toBe("Toyota Corolla 2021 · ABC-123");
  });
});
