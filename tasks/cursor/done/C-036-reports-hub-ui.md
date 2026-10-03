# C-036 - Hub de Reportes

## Agent
Cursor

## Status
DONE

## Priority
Medium

## Phase
PHASE 8 — Reports

## Dependencies
C-003, O-048

## Goal
Galería de reportes con el lenguaje visual del dashboard (SectionCard, no marketing).

## Acceptance Criteria
- [x] El hub lista las 4 familias.
- [x] Cada card navega a una vista.

## Completion Report
- Files changed:
  - `src/routes/_erp/reportes/index.tsx`
  - `src/components/reports/report-hub.tsx`
- Features completed:
  - `/reportes` con 4 familias (Ventas, Taller, Inventario, Cobranzas).
  - Navegación a rutas C-037.
- Tests:
  - `npm run build` OK.
- Remaining issues:
  - Ninguna.
