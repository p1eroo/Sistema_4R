# O-011 - Tipos de dominio Vehicle

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
O-002, O-007

## Goal
Modelar vehículo (placa, marca, modelo, año, color, km, dueño).

## Context
Dashboard: Toyota Corolla ABC-123, Kia Sportage B4X-521, Hyundai Tucson F6T-884, Toyota Yaris, Nissan Versa, Suzuki Swift. Vehículos pertenecen a clientes.

## Scope
- Vehicle, FuelType, VehicleStatus.
- Relación customerId, placa, VIN opcional, km, sede habitual.
- VehicleListItem.

## Out of Scope
- No historial de OT (Phase 3).
- No damage map.
- No UI.

## Expected Files
- src/domain/vehicles/types.ts
- src/domain/vehicles/index.ts

## Requirements
- customerId obligatorio.
- Placa como campo de negocio, no solo label.
- Reusar EntityId.

## Acceptance Criteria
- [x] Tipos compilan.
- [x] Un vehículo referencia un cliente.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/domain/vehicles/types.ts` (Vehicle, FuelType, VehicleStatus, VehicleListItem, `vehicleDisplayName`).
  - `src/domain/vehicles/index.ts` (barrel).
  - `src/domain/vehicles/types.test.ts` (nuevo).
- Features completed:
  - Vehículo con `customerId` obligatorio, placa como campo de negocio, VIN opcional, km, combustible y sede habitual.
  - `FuelType` peruano (gasolina, diesel, GNV, GLP, híbrido, eléctrico).
  - `VehicleListItem` con nombre de cliente para tablas.
  - `vehicleDisplayName` → `Toyota Corolla 2021 · ABC-123`. Reusa `EntityId`/`BranchRef` de O-002.
- Tests:
  - `src/domain/vehicles/types.test.ts`: 1 test.
  - Suite completa: 51/51 pasan. `npm run typecheck` exit 0.
- Remaining issues:
  - `npm run lint` global hereda el baseline Prettier; archivos de O-011 con 0 issues.
