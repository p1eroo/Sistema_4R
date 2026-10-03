import { describe, expect, it } from "vitest";

import { solesToMoney } from "./estimate-money";

describe("solesToMoney", () => {
  it("converts soles text to centavos", () => {
    expect(solesToMoney("100").amount).toBe(10000);
    expect(solesToMoney("100,50").amount).toBe(10050);
    expect(solesToMoney("").amount).toBe(0);
  });
});
