# C-019 - UI de Diagnósticos

## Agent
Cursor

## Status
DONE

## Priority
Medium

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
C-014, O-026

## Goal
Capturar y mostrar diagnóstico dentro de la OT y en `/taller/diagnosticos`.

## Context
Puente entre recepción y presupuesto.

## Scope
- Lista de diagnósticos.
- Formulario de hallazgos en tab Diagnóstico de la OT.

## Out of Scope
- No builder de presupuesto.
- No tipos nuevos.

## Expected Files
- src/routes/taller/diagnosticos/index.tsx
- src/components/diagnostics/diagnostic-form.tsx

## Requirements
- Form simple puede apoyarse en ui/form.
- UX de Cursor: jerarquía y vacío.

## Acceptance Criteria
- [x] Se guarda un diagnóstico en una OT.
- [x] La lista muestra el seed.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/diagnostics/diagnostic-form.tsx`
  - `src/components/diagnostics/diagnostic-list.tsx`
  - `src/components/diagnostics/diagnostic-status.ts`
  - `src/routes/_erp/taller/diagnosticos/index.tsx`
  - `src/components/work-orders/work-order-detail.tsx` (tab Diagnóstico)
- Features completed:
  - Lista seed DGN-0001/0002/0003 con OT y hallazgos.
  - Formulario de resumen + hallazgos; `upsert` marca Completado.
  - Tab Diagnóstico de la OT muestra el existente o un formulario vacío.
- Tests:
  - Typecheck y ESLint OK.
  - Browser: lista 3 seed. OT-2026-0184 guarda DGN-0004 Completado.
- Remaining issues:
  - Sin tipos nuevos. El listado no tiene ruta de detalle propia; abre la OT.
