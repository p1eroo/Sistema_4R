import type { DateTimeIso, EntityId } from "@/domain/shared";

export enum StockMovementReason {
  Initial = "initial",
  Purchase = "purchase",
  Sale = "sale",
  TransferIn = "transfer_in",
  TransferOut = "transfer_out",
  ReturnIn = "return_in",
  ReturnOut = "return_out",
  Adjustment = "adjustment",
  PhysicalCount = "physical_count",
}

export const STOCK_MOVEMENT_REASON_LABELS: Record<StockMovementReason, string> =
  {
    [StockMovementReason.Initial]: "Stock inicial",
    [StockMovementReason.Purchase]: "Compra",
    [StockMovementReason.Sale]: "Venta",
    [StockMovementReason.TransferIn]: "Transferencia entrada",
    [StockMovementReason.TransferOut]: "Transferencia salida",
    [StockMovementReason.ReturnIn]: "Devolución entrada",
    [StockMovementReason.ReturnOut]: "Devolución salida",
    [StockMovementReason.Adjustment]: "Ajuste",
    [StockMovementReason.PhysicalCount]: "Conteo físico",
  };

export type StockBalance = {
  readonly id: EntityId;
  readonly productId: EntityId;
  readonly branchId: EntityId;
  readonly quantity: number;
  readonly minStock: number;
  readonly restockable: boolean;
  readonly updatedAt: DateTimeIso;
};

export type StockMovement = {
  readonly id: EntityId;
  readonly productId: EntityId;
  readonly branchId: EntityId;
  readonly reason: StockMovementReason;
  readonly quantity: number;
  readonly balanceAfter: number;
  readonly referenceType?: string | undefined;
  readonly referenceId?: EntityId | undefined;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
};

export enum StockTransferStatus {
  Draft = "draft",
  InTransit = "in_transit",
  Received = "received",
  Cancelled = "cancelled",
}

export const STOCK_TRANSFER_STATUS_LABELS: Record<StockTransferStatus, string> =
  {
    [StockTransferStatus.Draft]: "Borrador",
    [StockTransferStatus.InTransit]: "En tránsito",
    [StockTransferStatus.Received]: "Recibida",
    [StockTransferStatus.Cancelled]: "Cancelada",
  };

export type StockTransferLine = {
  readonly productId: EntityId;
  readonly quantity: number;
};

export type StockTransfer = {
  readonly id: EntityId;
  readonly code: string;
  readonly fromBranchId: EntityId;
  readonly toBranchId: EntityId;
  readonly status: StockTransferStatus;
  readonly lines: readonly StockTransferLine[];
  readonly notes?: string | undefined;
  readonly receivedAt?: DateTimeIso | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export enum StockReturnDirection {
  ToSupplier = "to_supplier",
  FromCustomer = "from_customer",
}

export const STOCK_RETURN_DIRECTION_LABELS: Record<
  StockReturnDirection,
  string
> = {
  [StockReturnDirection.ToSupplier]: "Devolución a proveedor",
  [StockReturnDirection.FromCustomer]: "Devolución de cliente",
};

export type StockReturn = {
  readonly id: EntityId;
  readonly code: string;
  readonly productId: EntityId;
  readonly branchId: EntityId;
  readonly direction: StockReturnDirection;
  readonly quantity: number;
  readonly reason: string;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export type StockAdjustment = {
  readonly id: EntityId;
  readonly code: string;
  readonly productId: EntityId;
  readonly branchId: EntityId;
  readonly quantity: number;
  readonly newQuantity: number;
  readonly reason: string;
  readonly notes?: string | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export enum PhysicalCountStatus {
  Draft = "draft",
  InProgress = "in_progress",
  Completed = "completed",
}

export const PHYSICAL_COUNT_STATUS_LABELS: Record<PhysicalCountStatus, string> =
  {
    [PhysicalCountStatus.Draft]: "Borrador",
    [PhysicalCountStatus.InProgress]: "En conteo",
    [PhysicalCountStatus.Completed]: "Completado",
  };

export type PhysicalCountLine = {
  readonly productId: EntityId;
  readonly expected: number;
  readonly counted: number;
};

export type PhysicalCount = {
  readonly id: EntityId;
  readonly code: string;
  readonly branchId: EntityId;
  readonly status: PhysicalCountStatus;
  readonly lines: readonly PhysicalCountLine[];
  readonly notes?: string | undefined;
  readonly completedAt?: DateTimeIso | undefined;
  readonly createdAt: DateTimeIso;
  readonly updatedAt: DateTimeIso;
};

export function isLowStockBalance(
  balance: Pick<StockBalance, "quantity" | "minStock">,
): boolean {
  return balance.quantity <= balance.minStock;
}
