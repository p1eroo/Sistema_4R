import { describe, expect, it } from "vitest";

import {
  createInspectionChecklist,
  DAMAGE_SEVERITY_LABELS,
  DamageSeverity,
  DamageView,
  findDamageZone,
  zonesForView,
} from "@/domain/inspections";

describe("damage zones", () => {
  it("exposes stable zones for every view", () => {
    for (const view of Object.values(DamageView)) {
      expect(zonesForView(view).length).toBeGreaterThan(0);
    }
  });

  it("has unique zone ids and in-range coordinates", () => {
    const ids = new Set<string>();
    const allZones = Object.values(DamageView).flatMap((view) =>
      zonesForView(view),
    );

    for (const zone of allZones) {
      expect(ids.has(zone.id)).toBe(false);
      ids.add(zone.id);
      expect(zone.x).toBeGreaterThanOrEqual(0);
      expect(zone.x).toBeLessThanOrEqual(100);
      expect(zone.y).toBeGreaterThanOrEqual(0);
      expect(zone.y).toBeLessThanOrEqual(100);
    }
  });

  it("finds a zone by id", () => {
    expect(findDamageZone("front-bumper")?.label).toBe("Parachoques delantero");
  });
});

describe("severity labels", () => {
  it("labels every severity in Spanish", () => {
    for (const severity of Object.values(DamageSeverity)) {
      expect(DAMAGE_SEVERITY_LABELS[severity]).toBeTruthy();
    }
  });
});

describe("createInspectionChecklist", () => {
  it("returns the catalog unchecked by default and applies checked ids", () => {
    const empty = createInspectionChecklist();
    expect(empty.every((item) => !item.checked)).toBe(true);

    const checked = createInspectionChecklist(["frenos"]);
    expect(checked.find((item) => item.id === "frenos")?.checked).toBe(true);
  });
});
