import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const SRC_ROOT = join(process.cwd(), "src");
const SURFACE_FILE = join("components", "erp", "surface.tsx");
const AD_HOC_SURFACE = "border border-border bg-card";

function listTsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      return listTsxFiles(fullPath);
    }
    return entry.name.endsWith(".tsx") ? [fullPath] : [];
  });
}

function containsAdHocSurface(content: string): boolean {
  return content.includes(AD_HOC_SURFACE);
}

function findAdHocSurfaces(rootDir: string = SRC_ROOT): string[] {
  return listTsxFiles(rootDir)
    .filter((file) => !file.endsWith(SURFACE_FILE))
    .filter((file) => containsAdHocSurface(readFileSync(file, "utf8")))
    .map((file) => relative(rootDir, file));
}

describe("glass surface guard", () => {
  it("detects the legacy ad-hoc surface pattern", () => {
    const legacy =
      'className="rounded-xl border border-border bg-card shadow-xs"';
    const sanitized = 'className="glass"';

    expect(containsAdHocSurface(legacy)).toBe(true);
    expect(containsAdHocSurface(sanitized)).toBe(false);
  });

  it("does not keep ad-hoc surfaces outside Surface", () => {
    expect(findAdHocSurfaces()).toEqual([]);
  });
});
