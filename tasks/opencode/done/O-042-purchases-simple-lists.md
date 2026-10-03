# O-042 - Listados simples de Compras

## Agent
OpenCode

## Status
DONE

## Priority
Medium

## Phase
PHASE 5 — Purchases and Inventory

## Dependencies
O-039, C-003

## Goal
Tablas simples: lista de compras, cotizaciones y gastos diversos.

## Context
OpenCode posee tablas simples. El flujo «Nueva compra» es de Cursor (C-028).

## Scope
- Rutas `/compras`, `/compras/cotizaciones`, `/compras/gastos`.
- Filtros fecha/proveedor.
- Data-states.

## Out of Scope
- No wizard de nueva compra.
- No OC compleja (C-028).

## Expected Files
- src/routes/compras/index.tsx
- src/routes/compras/cotizaciones.tsx
- src/routes/compras/gastos.tsx
- src/components/purchases/purchase-table.tsx

## Requirements
- ModulePage.
- No rediseñar.

## Acceptance Criteria
- [x] Las listas muestran seeds.
- [x] EmptyState si se filtra sin resultados.

## Verification
- npm run lint (exit 0; 3 warnings react-refresh en purchase-table)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/components/purchases/purchase-table.tsx` (tabla genérica + helpers + `useSuppliers`).
  - `src/routes/_erp/compras/index.tsx` (lista de compras real).
  - `src/routes/_erp/compras/cotizaciones.tsx`.
  - `src/routes/_erp/compras/gastos.tsx`.
- Features completed:
  - Tabla simple reutilizable con `LoadingState`/`ErrorState`/`EmptyState`, `SectionCard` y `StatusBadge`.
  - Filtros por texto, proveedor, estado y fecha; datos desde `purchasesService` + `supplierService`.
  - Muestra seeds (2 compras, 2 cotizaciones, 3 gastos) y EmptyState al filtrar sin resultados.
- Tests:
  - UI sin lógica pura nueva (los datos ya están cubiertos por O-039). Suite completa: 247/247 pasan.
- Remaining issues:
  - **Rutas**: los archives viven en `src/routes/_erp/compras/*` (patrón real de C-002/C-003), no en `src/routes/compras/*`; se respetó la convención existente.
  - 3 warnings `react-refresh/only-export-components` por helpers exportados junto al componente; `npm run lint` sigue en exit 0.
