import { describe, expect, it } from "vitest";

import {
  createReceptionChecklist,
  FuelLevel,
  ReceptionStatus,
  type Reception,
} from "@/domain/reception";
import { asEntityId } from "@/domain/shared";
import { WorkOrderPriority, type WorkOrder } from "@/domain/work-orders";
import { WorkOrderStatus } from "@/domain/work-orders/status";

import {
  findWorkOrderByReception,
  receptionConfirmIssues,
} from "./reception-review-handoff";

function reception(overrides: Partial<Reception> = {}): Reception {
  return {
    id: asEntityId("RCP-TEST"),
    code: "REC-2026-0099",
    customerId: asEntityId("CUS-0001"),
    vehicleId: asEntityId("VEH-0001"),
    branchId: asEntityId("BR-LM"),
    status: ReceptionStatus.InProgress,
    reason: "Mantenimiento preventivo",
    odometerKm: 48250,
    fuelLevel: FuelLevel.Half,
    belongings: [],
    checklist: createReceptionChecklist(["documentos"]),
    createdAt: "2026-02-12T14:40:00.000Z",
    updatedAt: "2026-02-12T15:10:00.000Z",
    ...overrides,
  };
}

function order(overrides: Partial<WorkOrder> = {}): WorkOrder {
  return {
    id: asEntityId("WO-TEST"),
    code: "OT-2026-0999",
    customerId: asEntityId("CUS-0001"),
    vehicleId: asEntityId("VEH-0001"),
    branchId: asEntityId("BR-LM"),
    status: WorkOrderStatus.Diagnosis,
    priority: WorkOrderPriority.Normal,
    reason: "Mantenimiento preventivo",
    odometerKm: 48250,
    openedAt: "2026-02-12T15:20:00.000Z",
    createdAt: "2026-02-12T15:20:00.000Z",
    updatedAt: "2026-02-12T15:20:00.000Z",
    ...overrides,
  };
}

describe("receptionConfirmIssues", () => {
  it("allows a complete in-progress reception", () => {
    expect(receptionConfirmIssues(reception())).toEqual([]);
  });

  it("blocks a missing draft and an empty checklist", () => {
    expect(receptionConfirmIssues(undefined)).toEqual([
      "Guarda el cliente y el vehículo primero.",
    ]);
    expect(
      receptionConfirmIssues(
        reception({ checklist: createReceptionChecklist() }),
      ),
    ).toContain("Marca al menos un ítem del checklist para confirmar.");
  });

  it("blocks a cancelled reception and a missing reason", () => {
    expect(
      receptionConfirmIssues(reception({ status: ReceptionStatus.Cancelled })),
    ).toEqual(["No se puede confirmar una recepción cancelada."]);
    expect(receptionConfirmIssues(reception({ reason: "" }))).toContain(
      "El motivo de ingreso es obligatorio.",
    );
  });
});

describe("findWorkOrderByReception", () => {
  it("returns the order linked to the reception", () => {
    const linked = order({ receptionId: asEntityId("RCP-TEST") });

    expect(
      findWorkOrderByReception([order(), linked], asEntityId("RCP-TEST"))?.code,
    ).toBe("OT-2026-0999");
    expect(
      findWorkOrderByReception([order()], asEntityId("RCP-TEST")),
    ).toBeUndefined();
  });
});
