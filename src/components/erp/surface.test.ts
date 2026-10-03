import { describe, expect, it } from "vitest";

import { surfaceClass } from "./surface-class";

describe("surfaceClass", () => {
  it("maps each level to its glass utility", () => {
    expect(surfaceClass()).toBe("glass");
    expect(surfaceClass("strong")).toBe("glass-strong");
    expect(surfaceClass("subtle")).toBe("glass-subtle");
  });
});
