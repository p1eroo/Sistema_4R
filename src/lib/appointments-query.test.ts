import { describe, expect, it } from "vitest";

import { AppointmentStatus, todayDateKey } from "@/domain/appointments";
import { asEntityId } from "@/domain/shared";
import { appointmentSeed } from "@/mocks/appointments/seed";
import {
  AppointmentTimeBlock,
  appointmentTimeBlock,
  filterAppointments,
  groupAppointmentsByTimeBlock,
} from "@/lib/appointments-query";

const TODAY = todayDateKey();

describe("filterAppointments", () => {
  it("returns the three dashboard appointments of the day", () => {
    const result = filterAppointments(appointmentSeed, { date: TODAY });
    const customerIds = result.items.map(
      (appointment) => appointment.customerId,
    );

    expect(result.items).toHaveLength(3);
    expect(customerIds).toEqual(
      expect.arrayContaining(["CUS-0002", "CUS-0003", "CUS-0004"]),
    );
  });

  it("filters by status and branch", () => {
    const confirmed = filterAppointments(appointmentSeed, {
      date: TODAY,
      status: AppointmentStatus.Confirmed,
    });
    expect(confirmed.items).toHaveLength(2);

    const laMolina = filterAppointments(appointmentSeed, {
      date: TODAY,
      branchId: asEntityId("BR-LM"),
    });
    expect(laMolina.items).toHaveLength(1);
    expect(laMolina.items[0]?.customerId).toBe("CUS-0003");
  });

  it("supports a date range", () => {
    const result = filterAppointments(appointmentSeed, { fromDate: TODAY });

    expect(result.pagination.total).toBeGreaterThanOrEqual(3);
  });
});

describe("groupAppointmentsByTimeBlock", () => {
  it("groups today's appointments by time of day in Lima", () => {
    const today = filterAppointments(appointmentSeed, { date: TODAY }).items;
    const groups = groupAppointmentsByTimeBlock(today);

    expect(groups[AppointmentTimeBlock.Morning]).toHaveLength(2);
    expect(groups[AppointmentTimeBlock.Afternoon]).toHaveLength(1);
    expect(groups[AppointmentTimeBlock.Evening]).toHaveLength(0);
  });

  it("classifies a single appointment", () => {
    const [first] = appointmentSeed;
    if (!first) {
      throw new Error("seed vacío");
    }

    expect(appointmentTimeBlock(first)).toBe(AppointmentTimeBlock.Morning);
  });
});
