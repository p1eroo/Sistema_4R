# O-014 - Mock service de Vehicle

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
O-011, O-012, O-013, O-005

## Goal
CRUD de vehículos + listado por cliente y búsqueda por placa.

## Context
Recepción, OT e historial consultan vehículos por placa y por dueño.

## Scope
- list, getById, getByPlate, listByCustomer, create, update.
- Rechazar placa duplicada.
- Tests.

## Out of Scope
- No UI.
- No historial de trabajos.

## Expected Files
- src/mocks/vehicles/service.ts
- src/mocks/vehicles/service.test.ts

## Requirements
- Usar kit O-005.
- Validar con O-012.

## Acceptance Criteria
- [x] getByPlate('ABC-123') funciona.
- [x] Duplicar placa falla.
- [x] listByCustomer filtra bien.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/vehicles/service.ts` (`createVehicleService`, `vehicleService`, `VehicleService`, `VehicleNotFoundError`, `VehicleValidationError`).
  - `src/mocks/vehicles/service.test.ts` (nuevo).
- Features completed:
  - `list`, `getById`, `getByPlate` (case-insensitive), `listByCustomer`, `create`, `update` sobre el kit O-005.
  - Validación con schemas O-012; placa duplicada rechazada en create y update.
  - `listByCustomer` compone búsqueda + orden + paginación con helpers de O-003.
  - IDs `VEH-0013…` deterministas vía `idPrefix`.
- Tests:
  - `src/mocks/vehicles/service.test.ts`: 10 tests (list, id, placa, por cliente, create + id, placa duplicada, payload inválido, update, placa existente, not found).
  - Suite completa: 94/94 pasan. `npm run typecheck` exit 0.
- Remaining issues:
  - No hay `archive` de vehículo (no solicitado); `status` se mantiene en seed.
  - `npm run lint` global hereda el baseline Prettier; archivos de O-014 con 0 issues.
