# O-031 - Tipos y schemas de Product

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 4 — Products / Services / Suppliers

## Dependencies
O-002, O-004

## Goal
Modelar producto de almacén/mostrador (SKU, marca, stock mínimo, precios).

## Context
Dashboard: Aceite 5W30, Filtro de aceite, Pastillas de freno, Filtro de aire, Bujías NGK, stock crítico.

## Scope
- Product types + schemas + impuestos IGV.
- ProductStatus, unit, sku, minStock, price.

## Out of Scope
- No service (O-032).
- No UI.
- No movimientos de inventario (O-040).

## Expected Files
- src/domain/products/types.ts
- src/domain/products/schemas.ts

## Requirements
- Money en céntimos.
- SKU único a nivel tipo/schema de payload.

## Acceptance Criteria
- [x] Tipos/schemas compilan.
- [x] Schema rechaza precio negativo.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/domain/products/types.ts` (Product, ProductStatus, ProductUnit, ProductListItem, `isLowStock`).
  - `src/domain/products/schemas.ts` (create/update, `skuSchema`).
  - `src/domain/products/index.ts` (barrel).
  - `src/domain/products/types.test.ts` (nuevo).
- Features completed:
  - Producto con SKU (formato + normalización a mayúsculas), precio/costo en céntimos, IGV, stock/mínimo y unidad.
  - `isLowStock` para stock crítico del dashboard.
  - Schema rechaza precio negativo, SKU inválido y stock negativo.
- Tests:
  - `types.test.ts`: 4 tests.
  - Suite completa: 185/185 pasan.
- Remaining issues:
  - Unicidad real de SKU se valida en O-032 (service).
  - `npm run lint` global verde; archivos de O-031 con 0 issues.
