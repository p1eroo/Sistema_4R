# O-012 - Schemas Zod de Vehicle

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
O-011, O-004

## Goal
Validar alta/edición de vehículos, especialmente placa única a nivel schema de payload.

## Context
El form simple O-016 y la recepción necesitan validación de placa alineada al dashboard.

## Scope
- vehicleCreateSchema / vehicleUpdateSchema.
- Tests de placa y año.

## Out of Scope
- No uniqueness en DB (eso es O-014).
- No UI.

## Expected Files
- src/domain/vehicles/schemas.ts
- src/domain/vehicles/schemas.test.ts

## Requirements
- Reusar plate schema de O-004.
- Mensajes en español.

## Acceptance Criteria
- [x] Tests cubren placa inválida y año fuera de rango.
- [x] typecheck/test pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/vehicles/schemas.ts` (`vehicleObjectSchema`, `vehicleCreateSchema`, `vehicleUpdateSchema`, `MIN_VEHICLE_YEAR`, `MAX_VEHICLE_YEAR`).
  - `src/domain/vehicles/schemas.test.ts` (nuevo).
  - `src/domain/vehicles/types.ts` (ajuste compatible: opcionales con `| undefined`).
- Features completed:
  - Reusa `plateSchema` de O-004 (normaliza a mayúsculas; acepta ABC-123/B4X-521/F6T-884).
  - Año entre 1950 y año actual + 1; VIN opcional de 17 caracteres; km entero ≥ 0.
  - `customerId` obligatorio como `EntityId` branded; combustible con `FuelType`.
  - `vehicleUpdateSchema` parcial. Mensajes en español.
- Tests:
  - `src/domain/vehicles/schemas.test.ts`: 7 tests (válido/normalización, placas canónicas, placa inválida, año fuera de rango, marca/km, VIN, update parcial).
  - Suite completa: 80/80 pasan. `npm run typecheck` exit 0.
- Remaining issues:
  - Unicidad de placa se valida en O-014, no en el schema (por diseño).
  - `npm run lint` global hereda el baseline Prettier; archivos de O-012 con 0 issues.
