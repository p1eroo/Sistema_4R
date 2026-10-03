# C-018 - UI de Inspecciones

## Agent
Cursor

## Status
DONE

## Priority
Medium

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
C-003, O-021, C-010

## Goal
Listado y detalle de inspecciones reutilizando el damage map.

## Context
El menú tiene Inspecciones aparte de Recepción. Debe listar inspecciones históricas/activas.

## Scope
- Ruta `/taller/inspecciones` y `/$id`.
- Lista + detalle con damage map read/edit.

## Out of Scope
- No reescribir damage-map.tsx: importarlo.
- No QC.

## Expected Files
- src/routes/taller/inspecciones/index.tsx
- src/routes/taller/inspecciones/$id.tsx
- src/components/inspections/inspection-detail.tsx

## Requirements
- Reusar C-010.
- Data-states O-006.

## Acceptance Criteria
- [x] Una inspección seed se abre con sus daños.
- [x] Editar un punto persiste.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/inspections/inspection-list.tsx`
  - `src/components/inspections/inspection-detail.tsx`
  - `src/components/inspections/inspection-status.ts`
  - `src/routes/_erp/taller/inspecciones/index.tsx`
  - `src/routes/_erp/taller/inspecciones/$id.tsx`
- Features completed:
  - Lista de 2 inspecciones seed con placa, daños y estado.
  - Detalle reutiliza DamageMap/DamageLegend de C-010.
  - upsert/remove vía `inspectionService` y `receptionId`.
- Tests:
  - Typecheck y ESLint OK. Sin helper de negocio extra.
  - Browser: INSP-0001 (ABC-123, 2 daños) y INSP-0002 (B4X-521). Parachoques Leve → Moderado persiste.
- Remaining issues:
  - El mapa de C-010 no se reescribió. La puerta delantera está en vista lateral.
