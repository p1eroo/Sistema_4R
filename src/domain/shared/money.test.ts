import { describe, expect, it } from "vitest";

import { addMoney, formatMoney, money, multiplyMoney } from "@/domain/shared";

describe("money", () => {
  it("keeps amounts as integer cents", () => {
    expect(money(1280.4)).toEqual({ amount: 1280, currency: "PEN" });
  });

  it("formats PEN amounts with the canonical dashboard style", () => {
    expect(formatMoney(money(128000))).toBe("S/ 1,280.00");
    expect(formatMoney(money(0))).toBe("S/ 0.00");
    expect(formatMoney(money(5))).toBe("S/ 0.05");
  });

  it("formats negative amounts", () => {
    expect(formatMoney(money(-128000))).toBe("-S/ 1,280.00");
  });

  it("adds and multiplies amounts", () => {
    expect(addMoney(money(1000), money(250))).toEqual({
      amount: 1250,
      currency: "PEN",
    });
    expect(multiplyMoney(money(1000), 2.5)).toEqual({
      amount: 2500,
      currency: "PEN",
    });
  });
});
