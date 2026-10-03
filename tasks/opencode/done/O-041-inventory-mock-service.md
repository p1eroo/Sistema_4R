# O-041 - Mock de Inventory

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 5 — Purchases and Inventory

## Dependencies
O-040, O-032, O-005

## Goal
Saldos, movimientos, críticos y kardex en memoria.

## Context
POS, compras y dashboard de stock dependen de un único libro de movimientos.

## Scope
- getStock, listMovements, transfer, adjust, listCritical, kardex(productId).
- Seed: pastillas 2, filtro aceite 4, bujías 6; 7 SKUs críticos.
- Tests de transferencia y ajuste.

## Out of Scope
- No UI.
- No conteo físico UI (C-029).

## Expected Files
- src/mocks/inventory/seed.ts
- src/mocks/inventory/service.ts
- src/mocks/inventory/service.test.ts

## Requirements
- No saldos negativos salvo política documentada.
- Críticos = stock <= minStock.
- 2 SKUs sin reposición marcada.

## Acceptance Criteria
- [x] listCritical().length === 7.
- [x] Kardex de pastillas tiene movimientos.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/inventory/seed.ts` (10 saldos por sede; pastillas 2, filtro de aceite 4, bujías 6; 13 movimientos).
  - `src/mocks/inventory/service.ts` (`createInventoryService`, `inventoryService`).
  - `src/mocks/inventory/service.test.ts` (nuevo).
  - `src/domain/inventory/types.ts` (añadido `restockable` a StockBalance para "sin reposición").
- Features completed:
  - Saldos por `(productId, branchId)`; movimientos append-only con `balanceAfter` (kardex).
  - `transfer` valida stock y registra TransferOut/TransferIn; `adjust` registra el delta.
  - `listCritical` (7) y `listWithoutRestock` (2).
- Tests:
  - `service.test.ts`: 8 tests (7 críticos, 2 sin reposición, stock, kardex pastillas, transferencia, stock insuficiente, ajuste, ajuste inexistente).
  - Suite completa: 242/242 pasan.
- Remaining issues:
  - Ajusté `StockBalance` de O-040 añadiendo `restockable` (compatible).
  - `npm run lint` global verde; archivos de O-041 con 0 issues.
