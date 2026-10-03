# C-006 - UI listado de Vehículos

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
C-002, C-003, O-014, O-016

## Goal
Página Taller > Vehículos con búsqueda por placa y dueño.

## Context
El sidebar ya tiene Vehículos. Es la puerta al historial y a la recepción.

## Scope
- Ruta `/taller/vehiculos`.
- Tabla: placa, marca/modelo, dueño, km, sede.
- Alta con VehicleForm.
- Data-states O-006.

## Out of Scope
- No mapa de daños.
- No historial completo (C-023).
- No cambiar vehicle-form interno.

## Expected Files
- src/routes/taller/vehiculos/index.tsx
- src/components/vehicles/vehicle-list.tsx

## Requirements
- Query a O-014.
- Placa como elemento visual similar a las chips del dashboard (`bg-primary` + placa).

## Acceptance Criteria
- [x] ABC-123 aparece en la tabla.
- [x] Buscar por placa filtra.
- [x] Alta funciona.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/vehicles/vehicle-list.tsx`
  - `src/routes/_erp/taller/vehiculos/index.tsx` (ruta real; no `src/routes/taller/`)
- Features completed:
  - Tabla de unidades: placa (chip `bg-primary`), marca/modelo, dueño, km, sede.
  - Búsqueda cliente por placa/marca/modelo/dueño (dueño filtrado en UI).
  - Alta con VehicleForm (O-016) en dialog; Query a `vehicleService`.
  - Data-states O-006. No se editó `vehicle-form.tsx`.
- Tests:
  - `npm run typecheck` OK.
  - Lint de archivos de la tarea OK.
  - Browser: 12 seeds, ABC-123 + Lucía, filtro ABC-123, alta TST-001 / Kia Rio 2020 / Rojo / Lucía Ramos.
- Remaining issues:
  - Detalle de vehículo en C-007.
