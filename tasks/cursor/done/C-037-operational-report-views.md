# C-037 - Vistas de reportes operativos

## Agent
Cursor

## Status
DONE

## Priority
Medium

## Phase
PHASE 8 — Reports

## Dependencies
C-036, O-048

## Goal
4 vistas con tabla + chart existente (recharts ya en dashboard).

## Acceptance Criteria
- [x] Cada reporte muestra datos mock.
- [x] Filtros recargan.
- [x] Visual consistente con dashboard.

## Completion Report
- Files changed:
  - `src/routes/_erp/reportes/{ventas,taller,inventario,cobranzas}.tsx`
  - `src/components/reports/report-view.tsx`
  - `src/components/reports/report-chart.ts`
  - `src/components/reports/report-chart.test.ts`
- Features completed:
  - Tabla + gráfico de barras por reporte vía `reportsService.getReport`.
  - Filtros sede y fechas con toggle Aplicar.
  - Estados loading/empty/error con ModulePage.
- Tests:
  - `report-chart.test.ts`; `reports/service.test.ts` OK.
- Remaining issues:
  - CxC sigue siendo dataset fijo (gap O-048).
