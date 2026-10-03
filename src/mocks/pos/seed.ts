import {
  PaymentMethod,
  PosLineKind,
  PosStatus,
  type PosLine,
  type PosPayment,
  type PosTicket,
} from "@/domain/pos";
import { asEntityId, money } from "@/domain/shared";

const SEED_CREATED_AT = "2026-02-12T15:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-12T15:20:00.000Z";

function line(
  id: string,
  kind: PosLineKind,
  description: string,
  quantity: number,
  unitPrice: number,
  target?: { productId?: string; serviceId?: string },
): PosLine {
  return {
    id: asEntityId(id),
    kind,
    description,
    quantity,
    unitPrice: money(unitPrice),
    igvRate: 0.18,
    ...(target?.productId !== undefined
      ? { productId: asEntityId(target.productId) }
      : {}),
    ...(target?.serviceId !== undefined
      ? { serviceId: asEntityId(target.serviceId) }
      : {}),
  };
}

const referencePayments: PosPayment[] = [
  {
    id: asEntityId("PAY-0001"),
    method: PaymentMethod.Cash,
    amount: money(128000),
  },
];

export const posTicketSeed: PosTicket[] = [
  {
    id: asEntityId("TK-0001"),
    code: "TKT-2026-0001",
    documentNumber: "F001-00982",
    customerId: asEntityId("CUS-0001"),
    branchId: asEntityId("BR-LM"),
    cashierId: asEntityId("USR-0001"),
    status: PosStatus.Paid,
    lines: [
      line("PLN-0001", PosLineKind.Product, "Aceite 5W30 Mobil", 5, 8000, {
        productId: "PRD-0004",
      }),
      line(
        "PLN-0002",
        PosLineKind.Product,
        "Pastillas de freno delanteras",
        1,
        12000,
        { productId: "PRD-0002" },
      ),
      line(
        "PLN-0003",
        PosLineKind.Service,
        "Mantenimiento preventivo",
        1,
        40000,
        { serviceId: "SRV-0001" },
      ),
      line("PLN-0004", PosLineKind.Product, "Filtro de aire Wega", 5, 3295, {
        productId: "PRD-0005",
      }),
    ],
    payments: referencePayments,
    totals: {
      subtotal: money(108475),
      discount: money(0),
      igv: money(19525),
      total: money(128000),
    },
    paidAmount: money(128000),
    change: money(0),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("TK-0002"),
    code: "TKT-2026-0002",
    branchId: asEntityId("BR-LM"),
    cashierId: asEntityId("USR-0001"),
    status: PosStatus.Draft,
    lines: [
      line("PLN-0005", PosLineKind.Product, "Líquido de frenos DOT4", 2, 3500, {
        productId: "PRD-0006",
      }),
    ],
    payments: [],
    totals: {
      subtotal: money(7000),
      discount: money(0),
      igv: money(1260),
      total: money(8260),
    },
    paidAmount: money(0),
    change: money(0),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
];
