import { beforeEach, describe, expect, it } from "vitest";

import {
  AppointmentServiceType,
  AppointmentStatus,
  limaDateTimeIso,
  todayDateKey,
} from "@/domain/appointments";
import { asEntityId } from "@/domain/shared";
import {
  AppointmentNotFoundError,
  AppointmentValidationError,
  createAppointmentService,
  type AppointmentService,
} from "@/mocks/appointments/service";

const TODAY = todayDateKey();

let service: AppointmentService;

beforeEach(() => {
  service = createAppointmentService();
});

describe("appointmentService.listByDate", () => {
  it("returns the dashboard appointments of today", async () => {
    const result = await service.listByDate(new Date());
    const byCustomer = new Map(
      result.items.map((appointment) => [
        appointment.customerId,
        appointment.scheduledAt,
      ]),
    );

    expect(byCustomer.get(asEntityId("CUS-0002"))).toBe(
      limaDateTimeIso(TODAY, "09:30"),
    );
    expect(byCustomer.get(asEntityId("CUS-0003"))).toBe(
      limaDateTimeIso(TODAY, "11:00"),
    );
    expect(byCustomer.get(asEntityId("CUS-0004"))).toBe(
      limaDateTimeIso(TODAY, "15:30"),
    );
  });

  it("separates appointments by day", async () => {
    const today = await service.listByDate(TODAY);
    const tomorrow = await service.listByDate(
      new Date(Date.parse(`${TODAY}T12:00:00Z`) + 86_400_000),
    );

    expect(today.pagination.total).toBe(3);
    expect(tomorrow.pagination.total).toBe(3);
  });
});

describe("appointmentService.create", () => {
  it("creates a scheduled appointment with a stable id", async () => {
    const created = await service.create({
      customerId: asEntityId("CUS-0007"),
      vehicleId: asEntityId("VEH-0002"),
      branchId: asEntityId("BR-LM"),
      scheduledAt: limaDateTimeIso(TODAY, "17:30"),
      durationMinutes: 45,
      serviceType: AppointmentServiceType.Maintenance,
    });

    expect(created.id).toBe("APP-0007");
    expect(created.status).toBe(AppointmentStatus.Scheduled);
  });

  it("rejects invalid payloads", async () => {
    await expect(
      service.create({
        customerId: asEntityId("CUS-0007"),
        vehicleId: asEntityId("VEH-0002"),
        branchId: asEntityId("BR-LM"),
        scheduledAt: "no-es-fecha",
        durationMinutes: 5,
        serviceType: AppointmentServiceType.Maintenance,
      }),
    ).rejects.toBeInstanceOf(AppointmentValidationError);
  });
});

describe("appointmentService.update and cancel", () => {
  it("updates fields", async () => {
    const updated = await service.update(asEntityId("APP-0003"), {
      notes: "Cliente confirmó por teléfono.",
    });

    expect(updated.notes).toBe("Cliente confirmó por teléfono.");
    expect(updated.status).toBe(AppointmentStatus.Scheduled);
  });

  it("cancels an appointment", async () => {
    const cancelled = await service.cancel(asEntityId("APP-0002"));

    expect(cancelled.status).toBe(AppointmentStatus.Cancelled);
  });

  it("rejects unknown ids", async () => {
    await expect(
      service.update(asEntityId("APP-9999"), { notes: "x" }),
    ).rejects.toBeInstanceOf(AppointmentNotFoundError);
    await expect(service.cancel(asEntityId("APP-9999"))).rejects.toBeInstanceOf(
      AppointmentNotFoundError,
    );
  });
});
