# C-013 - UI listado de Órdenes de trabajo

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
C-003, O-024

## Goal
Lista de OT con filtros por estado, sede y búsqueda por código/placa.

## Context
Entrada a C-014 y al Kanban. El dashboard enlazará aquí en Phase 7.

## Scope
- Ruta `/taller/ordenes`.
- Tabla + chips de estado (labels del pie chart).
- CTA Nueva orden → recepción o alta mínima.
- Data-states.

## Out of Scope
- No detalle (C-014).
- No Kanban (C-016).
- No Estimate Builder.

## Expected Files
- src/routes/taller/ordenes/index.tsx
- src/components/work-orders/work-order-list.tsx

## Requirements
- StatusBadge existente.
- Códigos OT visibles como en el dashboard.

## Acceptance Criteria
- [x] OT-2026-0184 aparece en Control.
- [x] Filtro por estado funciona.
- [x] Click navega al detalle (ruta lista aunque C-014 la complete).

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/work-orders/work-order-list.tsx`
  - `src/components/work-orders/work-order-list-filters.ts`
  - `src/components/work-orders/work-order-list-filters.test.ts`
  - `src/routes/_erp/taller/ordenes/index.tsx`
  - `src/routes/_erp/taller/ordenes/$id.tsx` (ruta stub para C-014)
- Features completed:
  - Listado con búsqueda por código/placa, filtro de sede y chips Diagnóstico / En reparación / Control / Listo.
  - StatusBadge con labels del pie. CTA Nueva orden abre recepción.
  - Click en fila navega a `/taller/ordenes/$id`.
- Tests:
  - `work-order-list-filters.test.ts` 3/3.
  - Lint y typecheck OK.
  - Browser: 29 OT; Control deja 4 e incluye `OT-2026-0184` / Lucía / ABC-123; click abre `WO-2026-0184`.
- Remaining issues:
  - Detalle operativo en C-014.
