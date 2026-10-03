import {
  StockMovementReason,
  type StockBalance,
  type StockMovement,
} from "@/domain/inventory";
import { asEntityId } from "@/domain/shared";

const SEED_UPDATED_AT = "2026-02-20T08:00:00.000Z";

type BalanceSeed = {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  minStock: number;
  restockable?: boolean;
};

function balance(seed: BalanceSeed): StockBalance {
  return {
    id: asEntityId(seed.id),
    productId: asEntityId(seed.productId),
    branchId: asEntityId(seed.branchId),
    quantity: seed.quantity,
    minStock: seed.minStock,
    restockable: seed.restockable ?? true,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const stockBalanceSeed: StockBalance[] = [
  balance({
    id: "STK-0001",
    productId: "PRD-0001",
    branchId: "BR-LM",
    quantity: 4,
    minStock: 10,
  }),
  balance({
    id: "STK-0002",
    productId: "PRD-0002",
    branchId: "BR-LM",
    quantity: 2,
    minStock: 8,
  }),
  balance({
    id: "STK-0003",
    productId: "PRD-0003",
    branchId: "BR-LM",
    quantity: 6,
    minStock: 12,
  }),
  balance({
    id: "STK-0004",
    productId: "PRD-0004",
    branchId: "BR-LM",
    quantity: 24,
    minStock: 12,
  }),
  balance({
    id: "STK-0005",
    productId: "PRD-0005",
    branchId: "BR-LM",
    quantity: 15,
    minStock: 8,
  }),
  balance({
    id: "STK-0006",
    productId: "PRD-0006",
    branchId: "BR-LM",
    quantity: 20,
    minStock: 6,
  }),
  balance({
    id: "STK-0007",
    productId: "PRD-0001",
    branchId: "BR-SU",
    quantity: 3,
    minStock: 8,
  }),
  balance({
    id: "STK-0008",
    productId: "PRD-0002",
    branchId: "BR-SU",
    quantity: 1,
    minStock: 6,
    restockable: false,
  }),
  balance({
    id: "STK-0009",
    productId: "PRD-0003",
    branchId: "BR-SU",
    quantity: 2,
    minStock: 10,
    restockable: false,
  }),
  balance({
    id: "STK-0010",
    productId: "PRD-0004",
    branchId: "BR-SU",
    quantity: 5,
    minStock: 12,
  }),
];

type MovementSeed = {
  id: string;
  productId: string;
  branchId: string;
  reason: StockMovementReason;
  quantity: number;
  balanceAfter: number;
  createdAt: string;
};

function movement(seed: MovementSeed): StockMovement {
  return {
    id: asEntityId(seed.id),
    productId: asEntityId(seed.productId),
    branchId: asEntityId(seed.branchId),
    reason: seed.reason,
    quantity: seed.quantity,
    balanceAfter: seed.balanceAfter,
    createdAt: seed.createdAt,
  };
}

export const stockMovementSeed: StockMovement[] = [
  movement({
    id: "MOV-0001",
    productId: "PRD-0002",
    branchId: "BR-LM",
    reason: StockMovementReason.Initial,
    quantity: 10,
    balanceAfter: 10,
    createdAt: "2026-01-10T09:00:00.000Z",
  }),
  movement({
    id: "MOV-0002",
    productId: "PRD-0002",
    branchId: "BR-LM",
    reason: StockMovementReason.Sale,
    quantity: -8,
    balanceAfter: 2,
    createdAt: "2026-02-01T11:30:00.000Z",
  }),
  movement({
    id: "MOV-0003",
    productId: "PRD-0001",
    branchId: "BR-LM",
    reason: StockMovementReason.Initial,
    quantity: 12,
    balanceAfter: 12,
    createdAt: "2026-01-10T09:05:00.000Z",
  }),
  movement({
    id: "MOV-0004",
    productId: "PRD-0001",
    branchId: "BR-LM",
    reason: StockMovementReason.Sale,
    quantity: -8,
    balanceAfter: 4,
    createdAt: "2026-02-03T16:10:00.000Z",
  }),
  movement({
    id: "MOV-0005",
    productId: "PRD-0003",
    branchId: "BR-LM",
    reason: StockMovementReason.Initial,
    quantity: 20,
    balanceAfter: 20,
    createdAt: "2026-01-10T09:10:00.000Z",
  }),
  movement({
    id: "MOV-0006",
    productId: "PRD-0003",
    branchId: "BR-LM",
    reason: StockMovementReason.Sale,
    quantity: -14,
    balanceAfter: 6,
    createdAt: "2026-02-05T10:20:00.000Z",
  }),
  movement({
    id: "MOV-0007",
    productId: "PRD-0004",
    branchId: "BR-LM",
    reason: StockMovementReason.Initial,
    quantity: 24,
    balanceAfter: 24,
    createdAt: "2026-01-10T09:15:00.000Z",
  }),
  movement({
    id: "MOV-0008",
    productId: "PRD-0005",
    branchId: "BR-LM",
    reason: StockMovementReason.Initial,
    quantity: 15,
    balanceAfter: 15,
    createdAt: "2026-01-10T09:20:00.000Z",
  }),
  movement({
    id: "MOV-0009",
    productId: "PRD-0006",
    branchId: "BR-LM",
    reason: StockMovementReason.Initial,
    quantity: 20,
    balanceAfter: 20,
    createdAt: "2026-01-10T09:25:00.000Z",
  }),
  movement({
    id: "MOV-0010",
    productId: "PRD-0001",
    branchId: "BR-SU",
    reason: StockMovementReason.Initial,
    quantity: 3,
    balanceAfter: 3,
    createdAt: "2026-01-12T09:00:00.000Z",
  }),
  movement({
    id: "MOV-0011",
    productId: "PRD-0002",
    branchId: "BR-SU",
    reason: StockMovementReason.Initial,
    quantity: 1,
    balanceAfter: 1,
    createdAt: "2026-01-12T09:05:00.000Z",
  }),
  movement({
    id: "MOV-0012",
    productId: "PRD-0003",
    branchId: "BR-SU",
    reason: StockMovementReason.Initial,
    quantity: 2,
    balanceAfter: 2,
    createdAt: "2026-01-12T09:10:00.000Z",
  }),
  movement({
    id: "MOV-0013",
    productId: "PRD-0004",
    branchId: "BR-SU",
    reason: StockMovementReason.Initial,
    quantity: 5,
    balanceAfter: 5,
    createdAt: "2026-01-12T09:15:00.000Z",
  }),
];
