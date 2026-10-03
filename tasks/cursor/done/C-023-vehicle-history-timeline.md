# C-023 - Historial de vehículos

## Agent
Cursor

## Status
DONE

## Priority
Medium

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
C-007, O-024, O-029

## Goal
Timeline de recepciones, OT, inspecciones y entregas en la ficha del vehículo.

## Context
El menú tiene Historial de vehículos. C-007 dejó un placeholder.

## Scope
- Ruta `/taller/historial` (búsqueda por placa) + sección en vehicle-detail.
- Timeline visual ERP.

## Out of Scope
- No PDF.
- No cambiar seeds.

## Expected Files
- src/routes/taller/historial/index.tsx
- src/components/vehicles/vehicle-history.tsx
- src/components/vehicles/vehicle-detail.tsx (reemplazar placeholder)

## Requirements
- Reusar Activity style del dashboard si encaja.
- Links a OT/recepción.

## Acceptance Criteria
- [x] ABC-123 muestra eventos seed.
- [x] La búsqueda por placa funciona.
- [x] El placeholder de C-007 desaparece.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/taller/historial/index.tsx`
  - `src/components/vehicles/vehicle-history.tsx`
  - `src/components/vehicles/vehicle-history-events.ts`
  - `src/components/vehicles/vehicle-history-events.test.ts`
  - `src/components/vehicles/vehicle-detail.tsx`
- Features completed:
  - Búsqueda por placa (`getByPlate`) con draft ABC-123; Buscar carga el timeline.
  - Eventos seed de VEH-0001: APP-0005, DLV-0001, INSP-0001, REC-2026-0001, OT-2026-0184 (y pool 0204/0211).
  - Ficha `/taller/vehiculos/VEH-0001` muestra el mismo timeline (sin “Sin historial todavía”).
  - Placa inexistente (ZZ-9999) → EmptyState Sin resultados.
- Tests:
  - `vehicle-history-events.test.ts` OK.
  - ESLint de archivos C-023 OK.
  - Browser: historial ABC-123 + ficha VEH-0001 + vacío ZZ-9999.
- Remaining issues:
  - Recepción no tiene ruta `$id`; el link apunta a `/taller/recepcion`.
