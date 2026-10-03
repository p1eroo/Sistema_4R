# O-038 - Tipos y schemas de Purchases

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 5 — Purchases and Inventory

## Dependencies
O-036, O-031

## Goal
Modelar compra, OC, cotización y gasto diverso.

## Context
El menú Lovable: Nueva compra, Lista, Órdenes de compra, Cotizaciones, Gastos diversos.

## Scope
- Purchase, PurchaseOrder, Quote, Expense, líneas, estados.
- Schemas de cabecera/líneas.

## Out of Scope
- No service (O-039).
- No UI.
- No inventario movimientos.

## Expected Files
- src/domain/purchases/types.ts
- src/domain/purchases/schemas.ts

## Requirements
- supplierId obligatorio en compra/OC.
- Money céntimos + IGV.
- Estados draft/sent/received/cancelled.

## Acceptance Criteria
- [x] Tipos cubren los 5 subítems del menú.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/domain/purchases/types.ts` (Purchase, PurchaseOrder, Quote, Expense, PurchaseLine, PurchaseTotals, estados, `buildPurchaseCode`).
  - `src/domain/purchases/schemas.ts` (líneas + create de compra/OC/cotización/gasto).
  - `src/domain/purchases/index.ts` (barrel).
- Features completed:
  - Cobertura de los 5 subítems (compra, lista, OC, cotización, gasto diverso).
  - `supplierId` obligatorio en compra/OC/cotización; `Money` en céntimos + IGV.
  - Estados draft/sent/received/cancelled.
- Tests:
  - Sin lógica/helpers puros en esta tarea; cubierto por el service en O-039.
  - Suite completa: 242/242 pasan. `npm run typecheck` exit 0.
- Remaining issues:
  - Service en O-039.
  - `npm run lint` global verde; archivos de O-038 con 0 issues.
