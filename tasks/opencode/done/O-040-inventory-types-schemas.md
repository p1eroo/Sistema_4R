# O-040 - Tipos y schemas de Inventory

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 5 — Purchases and Inventory

## Dependencies
O-031

## Goal
Modelar stock por sede, movimientos, transferencias, devoluciones, ajustes y kardex.

## Context
Menú Inventario tiene 9 subítems. El dashboard muestra 7 stock crítico y 2 sin reposición.

## Scope
- StockBalance, StockMovement, Transfer, Return, Adjustment, PhysicalCount.
- MovementReason enums.
- Schemas de movimiento.

## Out of Scope
- No service (O-041).
- No UI.

## Expected Files
- src/domain/inventory/types.ts
- src/domain/inventory/schemas.ts

## Requirements
- Stock por (productId, branchId).
- Movimientos inmutables (append-only).

## Acceptance Criteria
- [x] Tipos cubren todos los subítems.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/domain/inventory/types.ts` (StockBalance, StockMovement, StockTransfer, StockReturn, StockAdjustment, PhysicalCount + enums/labels, `isLowStockBalance`).
  - `src/domain/inventory/schemas.ts` (movimiento, transferencia, devolución, ajuste, conteo físico).
  - `src/domain/inventory/index.ts` (barrel).
  - `src/domain/inventory/types.test.ts` (nuevo).
- Features completed:
  - Stock por `(productId, branchId)`; movimientos append-only con `balanceAfter`; kardex derivable.
  - Transferencias (origen≠destino validado), devoluciones, ajustes y conteo físico.
  - Cobertura de los subítems de Inventario.
- Tests:
  - `types.test.ts`: 4 tests.
  - Suite completa: 234/234 pasan.
- Remaining issues:
  - Service en O-041.
  - `npm run lint` global verde; archivos de O-040 con 0 issues.
