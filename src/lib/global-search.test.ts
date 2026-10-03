import { describe, expect, it } from "vitest";

import { resolveGlobalSearch } from "@/lib/global-search";

describe("resolveGlobalSearch", () => {
  it("resolves plate ABC-123 to the dashboard vehicle", async () => {
    const hit = await resolveGlobalSearch("ABC-123");

    expect(hit).not.toBeNull();
    expect(hit?.kind).toBe("vehicle");
    expect(hit?.href).toBe("/taller/vehiculos/VEH-0001");
  });

  it("resolves work order code OT-2026-0184", async () => {
    const hit = await resolveGlobalSearch("OT-2026-0184");

    expect(hit).not.toBeNull();
    expect(hit?.kind).toBe("work_order");
    expect(hit?.href).toBe("/taller/ordenes/WO-2026-0184");
  });
});
