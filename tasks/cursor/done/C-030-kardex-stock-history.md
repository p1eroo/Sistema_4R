# C-030 - Kardex y stock histórico

## Agent
Cursor

## Status
DONE

## Priority
Medium

## Phase
PHASE 5 — Purchases and Inventory

## Dependencies
O-043, O-041

## Goal
Vista kardex por producto y stock histórico consultable.

## Context
Subítems Kardex y Stock histórico. Es más analítico que una tabla plana.

## Scope
- Rutas `/inventario/kardex` y `/inventario/historico`.
- Selector de producto + timeline de movimientos.
- Saldos corridos.

## Out of Scope
- No reportes ejecutivos (Phase 8).
- No rediseñar crítico.

## Expected Files
- src/routes/inventario/kardex.tsx
- src/routes/inventario/historico.tsx
- src/components/inventory/kardex-view.tsx

## Requirements
- Saldos coherentes con O-041.
- Formato S/ y unidades.

## Acceptance Criteria
- [x] Kardex de pastillas muestra entradas/salidas y saldo.
- [x] Filtro de fechas funciona.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/inventario/kardex.tsx`
  - `src/routes/_erp/inventario/historico.tsx`
  - `src/components/inventory/kardex-view.tsx`
  - `src/components/inventory/kardex-filter.ts`
  - `src/components/inventory/kardex-filter.test.ts`
- Features completed:
  - Kardex Pastillas: Stock inicial +10, Venta -8, saldo 2, S/ 82.00 / Juego.
  - Filtro Desde 2026-02-01 deja solo la venta.
  - Stock histórico reutiliza la misma consulta.
- Tests:
  - `kardex-filter.test.ts` 3/3.
  - ESLint de archivos C-030 OK.
  - Browser: kardex + filtro + histórico.
- Remaining issues:
  - Reportes ejecutivos quedan en Phase 8.
