import { describe, expect, it } from "vitest";

import { isPlateLookup, normalizeLookupTerm } from "./reception-lookup";

describe("reception lookup", () => {
  it("detects plates and leaves names/docs as party search", () => {
    expect(isPlateLookup("ABC-123")).toBe(true);
    expect(isPlateLookup("abc-123")).toBe(true);
    expect(isPlateLookup("45678912")).toBe(false);
    expect(isPlateLookup("Lucía Ramos")).toBe(false);
  });

  it("normalizes plates to uppercase and trims party terms", () => {
    expect(normalizeLookupTerm("  abc-123  ")).toBe("ABC-123");
    expect(normalizeLookupTerm("  Lucía Ramos  ")).toBe("Lucía Ramos");
  });
});
