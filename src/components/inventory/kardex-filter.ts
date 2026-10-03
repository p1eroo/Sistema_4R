import type { StockMovement } from "@/domain/inventory";

export function movementDateKey(createdAt: string): string {
  return createdAt.slice(0, 10);
}

export function filterKardexByDate(
  movements: readonly StockMovement[],
  from?: string,
  to?: string,
): StockMovement[] {
  return movements.filter((movement) => {
    const key = movementDateKey(movement.createdAt);
    if (from && key < from) {
      return false;
    }
    if (to && key > to) {
      return false;
    }
    return true;
  });
}

export function signedQuantity(quantity: number): string {
  return quantity > 0 ? `+${quantity}` : String(quantity);
}
