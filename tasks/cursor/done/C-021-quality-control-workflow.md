# C-021 - Flujo de Control de calidad

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
C-014, O-029

## Goal
Checklist QC pass/fail y devolución a reparación.

## Context
OT-2026-0184 «pasó a control de calidad» es actividad del dashboard.

## Scope
- Ruta `/taller/calidad` + tab QC en detalle OT.
- Checklist, resultado, fotos mock, notas.
- Fail → in_repair; pass → ready.

## Out of Scope
- No entrega (C-022).
- No rediseñar detalle OT, solo completar tab.

## Expected Files
- src/routes/taller/calidad/index.tsx
- src/components/workshop/quality-check-form.tsx

## Requirements
- Delegar transiciones a O-029/O-024.
- StatusBadge coherente.

## Acceptance Criteria
- [x] Aprobar OT-2026-0184 la deja Listo.
- [x] Rechazar vuelve a En reparación.
- [x] Lista muestra pendientes de QC.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/taller/calidad/index.tsx`
  - `src/components/workshop/quality-check-form.tsx`
  - `src/components/workshop/quality-check-list.tsx`
  - `src/components/workshop/quality-check-status.ts`
  - `src/components/work-orders/work-order-detail.tsx` (tab QC)
- Features completed:
  - Lista pendientes `listByStatus(Quality)`: 0184, 0197, 0198, 0199.
  - Checklist + notas + fotos mock; Aprobar → Ready; Rechazar → InRepair.
  - Tab QC de la OT reutiliza el mismo formulario.
- Tests:
  - ESLint de archivos C-021 OK.
  - Browser: Aprobar 0184 la saca de pendientes (Listo). Rechazar 0198 (fuga) la saca.
- Remaining issues:
  - HMR puede resetear mocks al navegar; el tab QC vuelve a mostrar el form si la OT sigue en Control.
  - Typecheck global: `BranchStatus` de OpenCode, fuera de alcance.
