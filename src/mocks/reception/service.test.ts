import { beforeEach, describe, expect, it } from "vitest";

import {
  FuelLevel,
  ReceptionStatus,
  createReceptionChecklist,
} from "@/domain/reception";
import type { ReceptionDraftValues } from "@/domain/reception/schemas";
import { asEntityId } from "@/domain/shared";
import {
  ReceptionNotFoundError,
  ReceptionValidationError,
  createReceptionService,
  type ReceptionService,
} from "@/mocks/reception/service";

const DRAFT_INPUT: ReceptionDraftValues = {
  customerId: asEntityId("CUS-0001"),
  vehicleId: asEntityId("VEH-0001"),
  branchId: asEntityId("BR-LM"),
  reason: "Cambio de aceite",
};

let service: ReceptionService;

beforeEach(() => {
  service = createReceptionService();
});

describe("receptionService.list", () => {
  it("returns the seeded receptions", async () => {
    const result = await service.list();

    expect(result.items).toHaveLength(3);
  });

  it("includes a reception for the dashboard vehicle B4X-521", async () => {
    const result = await service.list();
    const vehicleIds = result.items.map((reception) => reception.vehicleId);

    expect(vehicleIds).toContain("VEH-0003");
  });
});

describe("receptionService.getById", () => {
  it("returns a reception by id", async () => {
    const reception = await service.getById(asEntityId("RCP-0001"));

    expect(reception?.code).toBe("REC-2026-0001");
  });
});

describe("receptionService.createDraft", () => {
  it("creates a draft with a stable id and code", async () => {
    const draft = await service.createDraft(DRAFT_INPUT);

    expect(draft.id).toBe("RCP-0004");
    expect(draft.code).toMatch(/^REC-\d{4}-0004$/);
    expect(draft.status).toBe(ReceptionStatus.Draft);
    expect(draft.checklist).toHaveLength(createReceptionChecklist().length);
  });

  it("rejects a draft without customer or vehicle", async () => {
    const withoutVehicle = {
      ...DRAFT_INPUT,
      vehicleId: undefined,
    } as unknown as ReceptionDraftValues;

    await expect(service.createDraft(withoutVehicle)).rejects.toBeInstanceOf(
      ReceptionValidationError,
    );
  });
});

describe("receptionService.updateStep", () => {
  it("advances a draft to in-progress with party and checklist data", async () => {
    const withParty = await service.updateStep(asEntityId("RCP-0003"), {
      step: "party",
      values: {
        customerId: asEntityId("CUS-0002"),
        vehicleId: asEntityId("VEH-0004"),
        branchId: asEntityId("BR-SU"),
        reason: "Diagnóstico general",
      },
    });
    expect(withParty.status).toBe(ReceptionStatus.InProgress);

    const withChecklist = await service.updateStep(asEntityId("RCP-0003"), {
      step: "checklist",
      values: {
        odometerKm: 63000,
        fuelLevel: FuelLevel.Half,
        belongings: [],
        checklist: createReceptionChecklist(["extintor"]),
      },
    });

    expect(withChecklist.odometerKm).toBe(63000);
    expect(withChecklist.fuelLevel).toBe(FuelLevel.Half);
    expect(
      withChecklist.checklist.find((item) => item.id === "extintor")?.checked,
    ).toBe(true);
  });

  it("rejects edits on completed receptions", async () => {
    await expect(
      service.updateStep(asEntityId("RCP-0001"), {
        step: "party",
        values: {
          customerId: asEntityId("CUS-0001"),
          vehicleId: asEntityId("VEH-0001"),
          branchId: asEntityId("BR-LM"),
          reason: "Otro motivo",
        },
      }),
    ).rejects.toBeInstanceOf(ReceptionValidationError);
  });
});

describe("receptionService.complete", () => {
  it("completes a valid draft", async () => {
    const completed = await service.complete(asEntityId("RCP-0003"));

    expect(completed.status).toBe(ReceptionStatus.Completed);
    expect(completed.receivedAt).toBeTruthy();
  });

  it("does not complete a reception without a reason", async () => {
    const noReason = { ...DRAFT_INPUT, reason: undefined };
    const draft = await service.createDraft(noReason);

    await expect(service.complete(draft.id)).rejects.toBeInstanceOf(
      ReceptionValidationError,
    );
  });

  it("rejects unknown ids", async () => {
    await expect(
      service.complete(asEntityId("RCP-9999")),
    ).rejects.toBeInstanceOf(ReceptionNotFoundError);
  });
});
