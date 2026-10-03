# C-035 - Filtros y deep links del Dashboard

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 7 — Dashboard

## Dependencies
C-034, C-002, C-013, C-020

## Goal
Hacer que filtros, «Ver taller», «Ver todo» y cards naveguen a módulos reales.

## Acceptance Criteria
- [x] Ver taller lleva a WIP u órdenes.
- [x] Stock bajo navega a crítico.
- [x] Cambiar sede refresca métricas.

## Completion Report
- Files changed:
  - `src/routes/index.tsx`
  - `src/components/dashboard/dashboard-links.ts`
  - `src/components/dashboard/dashboard-links.test.ts`
  - `src/domain/dashboard/filters.ts`
  - `src/domain/dashboard/filters.test.ts`
  - `src/mocks/dashboard/service.ts`
- Features completed:
  - Filtros sede/periodo/fechas aplicados al snapshot (toggle Aplicar/Aplicado).
  - Deep links: WIP, entregas, inventario crítico, citas, OT, reportes, POS.
  - Actividad reciente clickeable según entidad.
- Tests:
  - `dashboard-links.test.ts`, `filters.test.ts`; dashboard/reports mocks OK.
- Remaining issues:
  - C-035 profundiza fechas; rangos históricos siguen aproximados en O-047.
