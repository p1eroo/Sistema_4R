import {
  ExpenseCategory,
  PurchaseStatus,
  type Expense,
  type Purchase,
  type PurchaseLine,
  type PurchaseOrder,
  type Quote,
} from "@/domain/purchases";
import { asEntityId, money } from "@/domain/shared";
import { calculatePurchaseTotals } from "@/mocks/purchases/totals";

const SEED_CREATED_AT = "2026-02-10T09:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-18T10:00:00.000Z";

function line(
  id: string,
  description: string,
  quantity: number,
  unitCost: number,
  productId?: string,
): PurchaseLine {
  return {
    id: asEntityId(id),
    description,
    quantity,
    unitCost: money(unitCost),
    igvRate: 0.18,
    ...(productId !== undefined ? { productId: asEntityId(productId) } : {}),
  };
}

type PurchaseSeed = {
  id: string;
  code: string;
  supplierId: string;
  branchId: string;
  status: PurchaseStatus;
  lines: PurchaseLine[];
  invoiceNumber?: string;
  purchasedAt?: string;
};

function purchase(seed: PurchaseSeed): Purchase {
  return {
    id: asEntityId(seed.id),
    code: seed.code,
    supplierId: asEntityId(seed.supplierId),
    branchId: asEntityId(seed.branchId),
    status: seed.status,
    lines: seed.lines,
    totals: calculatePurchaseTotals(seed.lines),
    ...(seed.invoiceNumber !== undefined
      ? { invoiceNumber: seed.invoiceNumber }
      : {}),
    ...(seed.purchasedAt !== undefined
      ? { purchasedAt: seed.purchasedAt }
      : {}),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const purchaseSeed: Purchase[] = [
  purchase({
    id: "PU-0001",
    code: "COM-2026-0001",
    supplierId: "SUP-0001",
    branchId: "BR-LM",
    status: PurchaseStatus.Received,
    invoiceNumber: "F001-000982",
    purchasedAt: "2026-02-10T11:00:00.000Z",
    lines: [
      line("PUL-0001", "Filtro de aceite Wega", 10, 2800, "PRD-0001"),
      line("PUL-0002", "Bujías NGK", 20, 2100, "PRD-0003"),
    ],
  }),
  purchase({
    id: "PU-0002",
    code: "COM-2026-0002",
    supplierId: "SUP-0004",
    branchId: "BR-SU",
    status: PurchaseStatus.Draft,
    lines: [line("PUL-0003", "Pastillas de freno Bosch", 8, 8200, "PRD-0002")],
  }),
];

const ORDER_EXPECTED_AT = "2026-03-01T12:00:00.000Z";

export const purchaseOrderSeed: PurchaseOrder[] = [
  {
    id: asEntityId("OC-0001"),
    code: "OC-2026-0001",
    supplierId: asEntityId("SUP-0005"),
    branchId: asEntityId("BR-LM"),
    status: PurchaseStatus.Sent,
    lines: [line("POL-0001", "Aceite 5W30 Mobil", 24, 5600, "PRD-0004")],
    totals: calculatePurchaseTotals([
      line("POL-0001", "Aceite 5W30 Mobil", 24, 5600, "PRD-0004"),
    ]),
    expectedAt: ORDER_EXPECTED_AT,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("OC-0002"),
    code: "OC-2026-0002",
    supplierId: asEntityId("SUP-0002"),
    branchId: asEntityId("BR-SU"),
    status: PurchaseStatus.Draft,
    lines: [line("POL-0002", "Líquido de frenos DOT4", 12, 2200, "PRD-0006")],
    totals: calculatePurchaseTotals([
      line("POL-0002", "Líquido de frenos DOT4", 12, 2200, "PRD-0006"),
    ]),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
];

export const quoteSeed: Quote[] = [
  {
    id: asEntityId("COT-0001"),
    code: "COT-2026-0001",
    supplierId: asEntityId("SUP-0003"),
    branchId: asEntityId("BR-LM"),
    status: PurchaseStatus.Sent,
    lines: [line("QTL-0001", "Filtro de aire Wega", 10, 3400, "PRD-0005")],
    totals: calculatePurchaseTotals([
      line("QTL-0001", "Filtro de aire Wega", 10, 3400, "PRD-0005"),
    ]),
    validUntil: "2026-03-15T00:00:00.000Z",
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("COT-0002"),
    code: "COT-2026-0002",
    supplierId: asEntityId("SUP-0006"),
    branchId: asEntityId("BR-SU"),
    status: PurchaseStatus.Draft,
    lines: [line("QTL-0002", "Bujías NGK iridio", 30, 2100, "PRD-0003")],
    totals: calculatePurchaseTotals([
      line("QTL-0002", "Bujías NGK iridio", 30, 2100, "PRD-0003"),
    ]),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
];

type ExpenseSeed = {
  id: string;
  code: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  igv: number;
  branchId: string;
  incurredAt: string;
  supplierId?: string;
  documentNumber?: string;
};

function expense(seed: ExpenseSeed): Expense {
  return {
    id: asEntityId(seed.id),
    code: seed.code,
    ...(seed.supplierId !== undefined
      ? { supplierId: asEntityId(seed.supplierId) }
      : {}),
    branchId: asEntityId(seed.branchId),
    category: seed.category,
    description: seed.description,
    amount: money(seed.amount),
    igv: money(seed.igv),
    total: money(seed.amount + seed.igv),
    incurredAt: seed.incurredAt,
    ...(seed.documentNumber !== undefined
      ? { documentNumber: seed.documentNumber }
      : {}),
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const expenseSeed: Expense[] = [
  expense({
    id: "GAS-0001",
    code: "GAS-2026-0001",
    category: ExpenseCategory.Utilities,
    description: "Recibo de luz del taller",
    amount: 35000,
    igv: 6300,
    branchId: "BR-LM",
    incurredAt: "2026-02-05T00:00:00.000Z",
    documentNumber: "LUZ-0001",
  }),
  expense({
    id: "GAS-0002",
    code: "GAS-2026-0002",
    category: ExpenseCategory.Rent,
    description: "Alquiler del local",
    amount: 250000,
    igv: 0,
    branchId: "BR-LM",
    incurredAt: "2026-02-01T00:00:00.000Z",
  }),
  expense({
    id: "GAS-0003",
    code: "GAS-2026-0003",
    category: ExpenseCategory.Maintenance,
    description: "Mantenimiento del compresor",
    amount: 45000,
    igv: 8100,
    branchId: "BR-SU",
    incurredAt: "2026-02-08T00:00:00.000Z",
    supplierId: "SUP-0004",
  }),
];
