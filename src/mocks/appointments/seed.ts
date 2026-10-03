import {
  AppointmentServiceType,
  AppointmentStatus,
  limaDateTimeIso,
  todayDateKey,
  type Appointment,
} from "@/domain/appointments";
import { asEntityId } from "@/domain/shared";

const SEED_CREATED_AT = "2026-02-20T08:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-20T08:00:00.000Z";

const TODAY = todayDateKey();

function shiftDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

type AppointmentSeed = {
  id: string;
  customerId: string;
  vehicleId: string;
  branchId: string;
  dateKey: string;
  time: string;
  durationMinutes: number;
  serviceType: AppointmentServiceType;
  status: AppointmentStatus;
  notes?: string;
};

function appointment(seed: AppointmentSeed): Appointment {
  return {
    id: asEntityId(seed.id),
    customerId: asEntityId(seed.customerId),
    vehicleId: asEntityId(seed.vehicleId),
    branchId: asEntityId(seed.branchId),
    advisorId: asEntityId("USR-0001"),
    scheduledAt: limaDateTimeIso(seed.dateKey, seed.time),
    durationMinutes: seed.durationMinutes,
    serviceType: seed.serviceType,
    status: seed.status,
    ...(seed.notes !== undefined ? { notes: seed.notes } : {}),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const appointmentSeed: Appointment[] = [
  appointment({
    id: "APP-0001",
    customerId: "CUS-0002",
    vehicleId: "VEH-0004",
    branchId: "BR-SU",
    dateKey: TODAY,
    time: "09:30",
    durationMinutes: 60,
    serviceType: AppointmentServiceType.Maintenance,
    status: AppointmentStatus.Confirmed,
    notes: "Mantenimiento preventivo programado.",
  }),
  appointment({
    id: "APP-0002",
    customerId: "CUS-0003",
    vehicleId: "VEH-0005",
    branchId: "BR-LM",
    dateKey: TODAY,
    time: "11:00",
    durationMinutes: 60,
    serviceType: AppointmentServiceType.Diagnosis,
    status: AppointmentStatus.Confirmed,
  }),
  appointment({
    id: "APP-0003",
    customerId: "CUS-0004",
    vehicleId: "VEH-0006",
    branchId: "BR-SM",
    dateKey: TODAY,
    time: "15:30",
    durationMinutes: 60,
    serviceType: AppointmentServiceType.Inspection,
    status: AppointmentStatus.Scheduled,
  }),
  appointment({
    id: "APP-0004",
    customerId: "CUS-0005",
    vehicleId: "VEH-0003",
    branchId: "BR-SU",
    dateKey: shiftDateKey(TODAY, 1),
    time: "08:00",
    durationMinutes: 90,
    serviceType: AppointmentServiceType.Repair,
    status: AppointmentStatus.Confirmed,
  }),
  appointment({
    id: "APP-0005",
    customerId: "CUS-0001",
    vehicleId: "VEH-0001",
    branchId: "BR-LM",
    dateKey: shiftDateKey(TODAY, 1),
    time: "16:00",
    durationMinutes: 60,
    serviceType: AppointmentServiceType.Cosmetic,
    status: AppointmentStatus.Scheduled,
  }),
  appointment({
    id: "APP-0006",
    customerId: "CUS-0006",
    vehicleId: "VEH-0007",
    branchId: "BR-SM",
    dateKey: shiftDateKey(TODAY, 1),
    time: "10:00",
    durationMinutes: 60,
    serviceType: AppointmentServiceType.Maintenance,
    status: AppointmentStatus.Scheduled,
  }),
];
