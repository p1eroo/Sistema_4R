import { describe, expect, it } from "vitest";

import { appointmentSeed } from "@/mocks/appointments/seed";
import { inspectionSeed } from "@/mocks/inspections/seed";
import { receptionSeed } from "@/mocks/reception/seed";
import { workOrderSeed } from "@/mocks/work-orders/seed";
import { deliverySeed } from "@/mocks/workshop-ops/seed";

import {
  VehicleHistoryKind,
  buildVehicleHistory,
} from "./vehicle-history-events";

describe("buildVehicleHistory", () => {
  it("includes seed events for ABC-123 / VEH-0001", () => {
    const events = buildVehicleHistory({
      vehicleId: "VEH-0001",
      receptions: receptionSeed,
      inspections: inspectionSeed,
      workOrders: workOrderSeed,
      deliveries: deliverySeed,
      appointments: appointmentSeed,
    });

    expect(events.some((event) => event.id === "RCP-0001")).toBe(true);
    expect(events.some((event) => event.id === "INSP-0001")).toBe(true);
    expect(
      events.some(
        (event) =>
          event.kind === VehicleHistoryKind.WorkOrder &&
          event.title.includes("OT-2026-0184"),
      ),
    ).toBe(true);
    expect(events.some((event) => event.id === "DLV-0001")).toBe(true);
    expect(events.every((event) => event.at <= (events[0]?.at ?? ""))).toBe(
      true,
    );
  });
});
