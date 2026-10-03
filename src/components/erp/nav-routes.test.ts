import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { navLeaves } from "./nav";

describe("nav route files", () => {
  it("tiene un archivo de ruta por cada hoja del contrato C-002", () => {
    const missing: string[] = [];

    for (const leaf of navLeaves()) {
      const absolute = resolve(process.cwd(), leaf.file);
      if (!existsSync(absolute)) {
        missing.push(leaf.file);
      }
    }

    expect(missing).toEqual([]);
  });
});
