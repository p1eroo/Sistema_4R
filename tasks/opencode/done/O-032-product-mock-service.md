# O-032 - Mock de Product

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 4 — Products / Services / Suppliers

## Dependencies
O-031, O-005

## Goal
CRUD + seed de productos del dashboard, con stock mínimo.

## Context
Inventario y POS leerán este catálogo. Pastillas de freno = 2 und. (crítico).

## Scope
- Seed alineado a ranking y stock bajo.
- Service list/get/create/update.
- Tests de SKU duplicado.

## Out of Scope
- No kardex.
- No UI productos.

## Expected Files
- src/mocks/products/seed.ts
- src/mocks/products/service.ts
- src/mocks/products/service.test.ts

## Requirements
- Pastillas de freno delanteras stock 2.
- Aceite 5W30 y filtros presentes.

## Acceptance Criteria
- [x] listCriticalStock incluye pastillas.
- [x] Tests pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/products/seed.ts` (6 productos alineados al dashboard).
  - `src/mocks/products/service.ts` (`createProductService`, `productService`).
  - `src/mocks/products/service.test.ts` (nuevo).
- Features completed:
  - `list`, `listCriticalStock`, `getById`, `getBySku` (case-insensitive), `create`, `update`, `archive`.
  - SKU único normalizado a mayúsculas; seed con pastillas de freno (stock 2), filtro de aceite (4) y bujías (6) en stock crítico; aceite 5W30 presente.
- Tests:
  - `service.test.ts`: 5 tests (stock crítico, getBySku, create+SKU, duplicado, update/archive/not found).
  - Suite completa: 195/195 pasan.
- Remaining issues:
  - Sin kardex/movimientos (O-040/O-041).
  - `npm run lint` global verde; archivos de O-032 con 0 issues.
