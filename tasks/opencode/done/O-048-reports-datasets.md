# O-048 - Datasets y helpers de Reportes

## Agent
OpenCode

## Status
DONE

## Priority
Medium

## Phase
PHASE 8 — Reports

## Dependencies
O-047

## Goal
Consultas mock para reportes operativos (ventas, taller, inventario, CxC).

## Context
El menú tiene Reportes plano. El dashboard ya muestra finanzas e ingresos vs gastos; los reportes profundizan.

## Scope
- ReportQuery + datasets: sales, work-orders, inventory, receivables.
- Helpers de agrupación.
- Tests de un dataset.

## Out of Scope
- No UI hub (C-036).
- No export Excel real obligatorio (puede stub).

## Expected Files
- src/domain/reports/types.ts
- src/mocks/reports/service.ts
- src/mocks/reports/service.test.ts

## Requirements
- Reusar mocks existentes, no duplicar seeds.
- CxC seed S/ 24,350 y 4 vencidas si es posible.

## Acceptance Criteria
- [x] getReport('sales') devuelve filas.
- [x] Tests pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/reports/types.ts` (ReportQuery, ReportDataset, helpers `sumReportColumn`, `groupRowsBy`).
  - `src/domain/reports/index.ts` (barrel).
  - `src/mocks/reports/service.ts` (`createReportsService`, `reportsService`).
  - `src/mocks/reports/service.test.ts` (nuevo).
- Features completed:
  - `getReport({ key, branchId, range, from, to })` para sales, work-orders, inventory y receivables, reusando mocks existentes (POS, OT, inventario).
  - CxC dataset fijo S/ 24,350 (2435000 céntimos) con 4 vencidas.
  - Helpers puros de agrupación/suma.
- Tests:
  - `service.test.ts`: 6 tests (ventas, OT+inventario, CxC, listado, helpers).
  - Suite completa: 291/291 pasan.
- Remaining issues:
  - CxC es dataset de reportes (no hay seed de facturación).
  - `npm run lint` global verde; archivos de O-048 con 0 issues.
