# C-007 - UI detalle de Vehículo

## Agent
Cursor

## Status
DONE

## Priority
Medium

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
C-006, C-005

## Goal
Ficha de vehículo con dueño y placeholder de historial.

## Context
El historial real llega en C-023; ahora se necesita la ficha y el enlace al cliente.

## Scope
- Ruta `/taller/vehiculos/$id`.
- Datos técnicos, dueño (link a C-005), km, estado.
- Sección Historial vacía/placeholder que C-023 reemplazará.

## Out of Scope
- No implementar timeline de OT.
- No inspección de daños.

## Expected Files
- src/routes/taller/vehiculos/$id.tsx
- src/components/vehicles/vehicle-detail.tsx

## Requirements
- No romper C-006.
- Usar chrome C-003.

## Acceptance Criteria
- [x] La ficha de ABC-123 muestra Toyota Corolla y su dueño.
- [x] Link al cliente funciona.
- [x] Placeholder de historial visible.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/vehicles/vehicle-detail.tsx`
  - `src/routes/_erp/taller/vehiculos/$id.tsx` (ruta real; no `src/routes/taller/`)
  - `src/components/vehicles/vehicle-list.tsx` (click de fila al detalle)
  - `src/components/customers/customer-detail.tsx` (fila de vehículo al detalle)
- Features completed:
  - Ficha VEH-0001: Toyota Corolla 2021, placa ABC-123, km, estado, dueño.
  - Link a Lucía Ramos (`/clientes/CUS-0001`).
  - Placeholder de historial (C-023). EmptyState 404 si el id no existe.
- Tests:
  - Lint de archivos de la tarea OK.
  - `npm run typecheck` falla por `src/mocks/estimates/seed.ts` (OpenCode / O-027, fuera de alcance).
  - Browser: listado → VEH-0001, dueño → CUS-0001, VEH-9999 → no encontrado.
- Remaining issues:
  - Timeline real en C-023.
