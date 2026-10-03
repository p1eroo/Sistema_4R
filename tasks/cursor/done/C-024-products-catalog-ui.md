# C-024 - UI catálogo de Productos

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 4 — Products / Services / Suppliers

## Dependencies
C-003, O-032, O-034

## Goal
Catálogo visual de productos con stock, precio y alerta crítica.

## Context
Más denso que la taxonomía. El stock crítico del dashboard debe ser reconocible.

## Scope
- Ruta `/productos` o `/productos/productos`.
- Filtros categoría/marca, búsqueda SKU/nombre.
- Alta/edición.
- Badge stock crítico.

## Out of Scope
- No kardex (C-030).
- No POS cart.
- No editar taxonomy tables.

## Expected Files
- src/routes/productos/index.tsx
- src/components/products/product-catalog.tsx

## Requirements
- Pastillas muestran énfasis danger como el dashboard.
- Query O-032.

## Acceptance Criteria
- [x] Catálogo lista el seed.
- [x] Filtros funcionan.
- [x] Crear producto aparece en la lista.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/productos/index.tsx`
  - `src/components/products/product-catalog.tsx`
  - `src/components/products/product-form.tsx`
  - `src/components/products/product-catalog-filters.ts`
  - `src/components/products/product-catalog-filters.test.ts`
- Features completed:
  - Lista seed (6 SKU) con precio `formatMoney` y badge de stock.
  - Pastillas: danger / `Crítico · 2 und.` (mismo énfasis que el dashboard).
  - Filtros categoría (Frenos) y marca (Bosch); búsqueda SKU/nombre.
  - Alta `FLT-COMB-01` Filtro de combustible aparece en la lista.
- Tests:
  - `product-catalog-filters.test.ts` 4 tests OK.
  - ESLint de archivos C-024 OK (warnings ajenos en inventory/purchases).
  - Browser: seed, filtros Frenos/Bosch, create visible.
- Remaining issues:
  - El seed de producto no trae `categoryId`; la categoría se infiere por prefijo de SKU (sin tocar seeds ni taxonomía).
