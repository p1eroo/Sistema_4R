import {
  CashMovementType,
  CashSessionStatus,
  type CashSession,
} from "@/domain/cash";
import { limaDateTimeIso, todayDateKey } from "@/domain/appointments";
import { asEntityId, money } from "@/domain/shared";

const TODAY = todayDateKey();

export const cashSessionSeed: CashSession[] = [
  {
    id: asEntityId("CS-0001"),
    code: "CAJ-2026-0001",
    branchId: asEntityId("BR-LM"),
    branchSlug: "molina",
    cashierId: asEntityId("USR-0001"),
    status: CashSessionStatus.Open,
    openingAmount: money(50000),
    movements: [
      {
        id: asEntityId("CM-0001"),
        type: CashMovementType.Sale,
        amount: money(128000),
        reference: "F001-00982",
        notes: "Venta POS mostrador",
        createdAt: limaDateTimeIso(TODAY, "08:20"),
      },
      {
        id: asEntityId("CM-0002"),
        type: CashMovementType.Expense,
        amount: money(3500),
        notes: "Compra de útiles de limpieza",
        createdAt: limaDateTimeIso(TODAY, "09:05"),
      },
    ],
    openedAt: limaDateTimeIso(TODAY, "08:00"),
    createdAt: limaDateTimeIso(TODAY, "08:00"),
    updatedAt: limaDateTimeIso(TODAY, "09:05"),
  },
  {
    id: asEntityId("CS-0002"),
    code: "CAJ-2026-0002",
    branchId: asEntityId("BR-SU"),
    branchSlug: "surco",
    cashierId: asEntityId("USR-0002"),
    status: CashSessionStatus.Closed,
    openingAmount: money(40000),
    movements: [],
    openedAt: limaDateTimeIso(TODAY, "07:30"),
    closedAt: limaDateTimeIso(TODAY, "13:00"),
    closingAmount: money(40000),
    createdAt: limaDateTimeIso(TODAY, "07:30"),
    updatedAt: limaDateTimeIso(TODAY, "13:00"),
  },
];
