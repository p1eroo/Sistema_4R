import { AdvanceStatus, type CustomerAdvance } from "@/domain/advances";
import { limaDateTimeIso, todayDateKey } from "@/domain/appointments";
import { PaymentMethod } from "@/domain/pos";
import { asEntityId, money } from "@/domain/shared";

const TODAY = todayDateKey();

function daysAgo(days: number): string {
  const date = new Date(`${TODAY}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export const customerAdvanceSeed: CustomerAdvance[] = [
  {
    id: asEntityId("ADV-0001"),
    code: "ANT-2026-0001",
    customerId: asEntityId("CUS-0001"),
    branchId: asEntityId("BR-LM"),
    method: PaymentMethod.Yape,
    amount: money(30000),
    applications: [],
    status: AdvanceStatus.Active,
    reference: "YP-883120",
    concept: "Separación de juego de pastillas y mano de obra",
    receivedAt: limaDateTimeIso(daysAgo(2), "10:15"),
    createdAt: limaDateTimeIso(daysAgo(2), "10:15"),
    updatedAt: limaDateTimeIso(daysAgo(2), "10:15"),
  },
  {
    id: asEntityId("ADV-0002"),
    code: "ANT-2026-0002",
    customerId: asEntityId("CUS-0002"),
    branchId: asEntityId("BR-LM"),
    method: PaymentMethod.Transfer,
    amount: money(80000),
    applications: [
      {
        id: asEntityId("ADA-0001"),
        reference: "F001-00975",
        amount: money(45000),
        appliedAt: limaDateTimeIso(daysAgo(5), "16:40"),
      },
    ],
    status: AdvanceStatus.Active,
    reference: "BCP-0045521",
    concept: "Adelanto para cambio de embrague",
    receivedAt: limaDateTimeIso(daysAgo(9), "09:30"),
    createdAt: limaDateTimeIso(daysAgo(9), "09:30"),
    updatedAt: limaDateTimeIso(daysAgo(5), "16:40"),
  },
  {
    id: asEntityId("ADV-0003"),
    code: "ANT-2026-0003",
    customerId: asEntityId("CUS-0003"),
    branchId: asEntityId("BR-LM"),
    method: PaymentMethod.Cash,
    amount: money(15000),
    applications: [
      {
        id: asEntityId("ADA-0002"),
        reference: "F001-00968",
        amount: money(15000),
        appliedAt: limaDateTimeIso(daysAgo(12), "11:05"),
      },
    ],
    status: AdvanceStatus.Applied,
    concept: "Diagnóstico computarizado",
    receivedAt: limaDateTimeIso(daysAgo(14), "08:50"),
    createdAt: limaDateTimeIso(daysAgo(14), "08:50"),
    updatedAt: limaDateTimeIso(daysAgo(12), "11:05"),
  },
  {
    id: asEntityId("ADV-0004"),
    code: "ANT-2026-0004",
    customerId: asEntityId("CUS-0004"),
    branchId: asEntityId("BR-LM"),
    method: PaymentMethod.Card,
    amount: money(50000),
    applications: [],
    status: AdvanceStatus.Active,
    reference: "VISA-4412",
    concept: "Adelanto de mantenimiento de flota",
    receivedAt: limaDateTimeIso(TODAY, "08:40"),
    createdAt: limaDateTimeIso(TODAY, "08:40"),
    updatedAt: limaDateTimeIso(TODAY, "08:40"),
  },
  {
    id: asEntityId("ADV-0005"),
    code: "ANT-2026-0005",
    customerId: asEntityId("CUS-0005"),
    branchId: asEntityId("BR-LM"),
    method: PaymentMethod.Cash,
    amount: money(20000),
    applications: [],
    status: AdvanceStatus.Cancelled,
    concept: "Separación de batería",
    cancelReason: "Cliente desistió de la compra; se devolvió el efectivo.",
    receivedAt: limaDateTimeIso(daysAgo(20), "15:20"),
    createdAt: limaDateTimeIso(daysAgo(20), "15:20"),
    updatedAt: limaDateTimeIso(daysAgo(18), "10:00"),
  },
];
