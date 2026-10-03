import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins the provided class names", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("ignores falsy values", () => {
    const hidden = false;
    expect(cn("flex", hidden && "hidden", undefined, null, "gap-2")).toBe(
      "flex gap-2",
    );
  });

  it("resolves conflicting tailwind classes with the last one winning", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
