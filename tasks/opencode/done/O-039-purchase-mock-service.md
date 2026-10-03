# O-039 - Mock de Purchases

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 5 — Purchases and Inventory

## Dependencies
O-038, O-005

## Goal
Services de compras/OC/cotizaciones/gastos + seeds.

## Context
C-028 y O-042 consumen esto. Recibir una compra deberá poder avisar a inventario en O-041 (interfaz, no UI).

## Scope
- CRUD mock por tipo de documento.
- receivePurchase hook (evento o función) para stock.
- Tests.

## Out of Scope
- No UI.
- No kardex UI.

## Expected Files
- src/mocks/purchases/seed.ts
- src/mocks/purchases/service.ts
- src/mocks/purchases/service.test.ts

## Requirements
- IDs estables.
- Totales con helper o reuso de estimates/totals si aplica.

## Acceptance Criteria
- [x] Se crea y recibe una compra en tests.
- [x] Gastos diversos no mueven stock.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/purchases/totals.ts` (`calculatePurchaseTotals`, reusa IGV de estimates).
  - `src/mocks/purchases/seed.ts` (2 compras, 2 OC, 2 cotizaciones, 3 gastos).
  - `src/mocks/purchases/service.ts` (`createPurchasesService`, `purchasesService`).
  - `src/mocks/purchases/service.test.ts` (nuevo).
- Features completed:
  - CRUD por documento (compra/OC/cotización/gasto) con IDs/códigos estables (`COM/OC/COT/GAS-YYYY-NNNN`).
  - `receivePurchase` incrementa stock vía `inventoryService.adjust` para líneas con `productId` (interfaz con O-041).
  - Gastos no tocan inventario.
- Tests:
  - `service.test.ts`: 4 tests (listados, crear+recibir con stock, compra inexistente, gasto sin mover stock).
  - Suite completa: 247/247 pasan.
- Remaining issues:
  - `receivePurchase` solo incrementa saldos existentes (no crea saldo nuevo); documentado.
  - `npm run lint` global verde; archivos de O-039 con 0 issues.
