import { describe, expect, it } from "vitest";

import { customerSeed } from "@/mocks/customers/seed";

describe("customerSeed", () => {
  it("seeds between 12 and 20 customers", () => {
    expect(customerSeed.length).toBeGreaterThanOrEqual(12);
    expect(customerSeed.length).toBeLessThanOrEqual(20);
  });

  it("includes the dashboard customer names", () => {
    const names = customerSeed.map((customer) => customer.displayName);

    for (const name of [
      "Lucía Ramos",
      "Ana Torres",
      "Luis Paredes",
      "Rosa Huamán",
    ]) {
      expect(names).toContain(name);
    }
  });

  it("has unique ids and document numbers", () => {
    const ids = new Set(customerSeed.map((customer) => customer.id));
    const documents = new Set(
      customerSeed.map((customer) => customer.documentNumber),
    );

    expect(ids.size).toBe(customerSeed.length);
    expect(documents.size).toBe(customerSeed.length);
  });

  it("always points to a preferred branch", () => {
    for (const customer of customerSeed) {
      expect(customer.preferredBranch?.id).toBeTruthy();
      expect(customer.preferredBranch?.name).toBeTruthy();
    }
  });
});
