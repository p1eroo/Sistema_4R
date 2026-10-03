import { beforeEach, describe, expect, it } from "vitest";

import {
  createInspectionChecklist,
  DamageMarkKind,
  DamageSeverity,
  InspectionStatus,
  type DamageZoneId,
} from "@/domain/inspections";
import { asEntityId } from "@/domain/shared";
import {
  InspectionValidationError,
  createInspectionService,
  type InspectionService,
} from "@/mocks/inspections/service";

let service: InspectionService;

beforeEach(() => {
  service = createInspectionService();
});

describe("inspectionService reads", () => {
  it("lists the seeded inspections", async () => {
    const result = await service.list();

    expect(result.items).toHaveLength(2);
  });

  it("gets by id and by reception", async () => {
    expect((await service.getById(asEntityId("INSP-0001")))?.vehicleId).toBe(
      "VEH-0001",
    );
    expect((await service.getByReception(asEntityId("RCP-0002")))?.id).toBe(
      "INSP-0002",
    );
  });
});

describe("inspectionService.upsertDamagePoint", () => {
  it("marks three damages on a reception", async () => {
    const zones: DamageZoneId[] = [
      "front-hood",
      "left-rear-door",
      "rear-bumper",
    ];

    let inspection = await service.getByReception(asEntityId("RCP-0003"));
    expect(inspection).toBeUndefined();

    for (const zoneId of zones) {
      inspection = await service.upsertDamagePoint(asEntityId("RCP-0003"), {
        zoneId,
        severity: DamageSeverity.Moderate,
      });
    }

    expect(inspection?.damagePoints).toHaveLength(3);
    expect(inspection?.vehicleId).toBe("VEH-0004");
    expect(inspection?.status).toBe(InspectionStatus.InProgress);
  });

  it("updates the point of the same zone instead of duplicating it", async () => {
    const first = await service.upsertDamagePoint(asEntityId("RCP-0003"), {
      zoneId: "front-hood",
      severity: DamageSeverity.Minor,
    });
    const second = await service.upsertDamagePoint(asEntityId("RCP-0003"), {
      zoneId: "front-hood",
      severity: DamageSeverity.Severe,
      notes: "Golpe fuerte",
    });

    expect(second.damagePoints).toHaveLength(1);
    expect(second.damagePoints[0]?.severity).toBe(DamageSeverity.Severe);
    expect(second.damagePoints[0]?.id).toBe(first.damagePoints[0]?.id);
  });

  it("rejects unknown zones and receptions", async () => {
    await expect(
      service.upsertDamagePoint(asEntityId("RCP-0003"), {
        zoneId: "nope" as unknown as DamageZoneId,
        severity: DamageSeverity.Minor,
      }),
    ).rejects.toBeInstanceOf(InspectionValidationError);

    await expect(
      service.upsertDamagePoint(asEntityId("RCP-9999"), {
        zoneId: "front-hood",
        severity: DamageSeverity.Minor,
      }),
    ).rejects.toBeInstanceOf(InspectionValidationError);
  });
});

describe("inspectionService.removeDamagePoint", () => {
  it("removes an existing point and rejects unknown ids", async () => {
    const updated = await service.removeDamagePoint(
      asEntityId("RCP-0001"),
      asEntityId("DMP-0001"),
    );

    expect(updated.damagePoints.map((point) => point.id)).not.toContain(
      "DMP-0001",
    );

    await expect(
      service.removeDamagePoint(asEntityId("RCP-0001"), asEntityId("DMP-9999")),
    ).rejects.toBeInstanceOf(InspectionValidationError);
  });
});

describe("inspectionService.saveChecklist", () => {
  it("replaces the checklist of an inspection", async () => {
    const checklist = createInspectionChecklist(["frenos", "limpieza"]);
    const updated = await service.saveChecklist(
      asEntityId("RCP-0001"),
      checklist,
    );

    expect(
      updated.checklist.find((item) => item.id === "frenos")?.checked,
    ).toBe(true);
    expect(
      updated.checklist.every((item) => item.id !== "aceite" || !item.checked),
    ).toBe(true);
  });
});

describe("inspectionService damage marks", () => {
  it("adds a point and a stroke mark on the vehicle diagram", async () => {
    const receptionId = asEntityId("RCP-0001");
    const before = (await service.getByReception(receptionId))?.damageMarks;

    await service.addDamageMark(receptionId, {
      kind: DamageMarkKind.Point,
      position: { x: 12.34, y: 50 },
      severity: DamageSeverity.Minor,
      notes: " Abolladura ",
    });
    const updated = await service.addDamageMark(receptionId, {
      kind: DamageMarkKind.Stroke,
      position: { x: 40, y: 20 },
      path: [
        { x: 40, y: 20 },
        { x: 55, y: 22 },
      ],
      severity: DamageSeverity.Severe,
    });

    const marks = updated.damageMarks ?? [];
    expect(marks).toHaveLength((before?.length ?? 0) + 2);
    expect(marks.at(-2)).toMatchObject({
      kind: DamageMarkKind.Point,
      position: { x: 12.3, y: 50 },
      notes: "Abolladura",
    });
    expect(marks.at(-1)?.path).toHaveLength(2);
  });

  it("rejects marks outside the diagram and strokes without a path", async () => {
    const receptionId = asEntityId("RCP-0001");

    await expect(
      service.addDamageMark(receptionId, {
        kind: DamageMarkKind.Point,
        position: { x: 140, y: 10 },
        severity: DamageSeverity.Minor,
      }),
    ).rejects.toBeInstanceOf(InspectionValidationError);
    await expect(
      service.addDamageMark(receptionId, {
        kind: DamageMarkKind.Stroke,
        position: { x: 10, y: 10 },
        severity: DamageSeverity.Minor,
      }),
    ).rejects.toBeInstanceOf(InspectionValidationError);
  });

  it("removes a mark by id", async () => {
    const receptionId = asEntityId("RCP-0001");
    const added = await service.addDamageMark(receptionId, {
      kind: DamageMarkKind.Point,
      position: { x: 80, y: 80 },
      severity: DamageSeverity.Moderate,
    });
    const markId = added.damageMarks!.at(-1)!.id;

    const updated = await service.removeDamageMark(receptionId, markId);
    expect(updated.damageMarks?.map((mark) => mark.id)).not.toContain(markId);
  });
});
