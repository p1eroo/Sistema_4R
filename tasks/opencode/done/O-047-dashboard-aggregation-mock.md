# O-047 - Mock de agregación del Dashboard

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 7 — Dashboard

## Dependencies
O-024, O-025, O-027, O-041, O-045

## Goal
Un service que calcule las métricas y series que el dashboard ya pinta, a partir de los mocks.

## Context
`src/routes/index.tsx` tiene arrays locales (salesData, workOrderData, activities). No se rediseña: se reemplazan por datos del service. Si un número no se puede reproducir aún, documentar el gap.

## Scope
- getDashboardSnapshot({ branchId, range }).
- Métricas, series, rankings, actividades, listos pronto, stock bajo, citas, OT pendientes.
- Tests de conteo de OT por estado y críticos.

## Out of Scope
- No editar `src/routes/index.tsx` (C-034).
- No nuevas cards.

## Expected Files
- src/mocks/dashboard/service.ts
- src/mocks/dashboard/service.test.ts
- src/domain/dashboard/types.ts

## Requirements
- Misma forma de datos que necesita la UI actual.
- Filtros sede/periodo aunque el resultado sea aproximado.

## Acceptance Criteria
- [x] workOrder slices coinciden con O-024.
- [x] critical stock usa O-041.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/dashboard/types.ts` (DashboardSnapshot y sub-tipos; filtros).
  - `src/domain/dashboard/index.ts` (barrel).
  - `src/mocks/dashboard/service.ts` (`createDashboardService`, `dashboardService`).
  - `src/mocks/dashboard/service.test.ts` (nuevo).
- Features completed:
  - `getDashboardSnapshot({ branchId, range })` agrega métricas, slices de OT, series, rankings, actividades, listos pronto, stock bajo, citas y OT pendientes.
  - Slices de OT calculados desde O-024 (7/12/4/6); stock crítico desde O-041 (7 y 2 sin reposición).
  - Rankings desde líneas de presupuestos; citas de hoy y vehículos listos desde sus services.
  - `gaps` documenta lo no reproducible con los mocks actuales (financeSeries, series históricas, rankings de ventas).
- Tests:
  - `service.test.ts`: 3 tests (slices, stock crítico/gaps, citas+listos+pendientes).
  - Suite completa: 262/262 pasan.
- Remaining issues:
  - No se edita `src/routes/index.tsx` (C-034 conectará el service).
  - `npm run lint` global verde; archivos de O-047 con 0 issues.
