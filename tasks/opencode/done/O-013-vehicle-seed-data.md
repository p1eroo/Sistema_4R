# O-013 - Seed data de Vehicle

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
O-011, O-009

## Goal
Sembrar los vehículos del dashboard ligados a clientes existentes.

## Context
La coherencia de placas es crítica para dashboard, recepción, WIP y entregas.

## Scope
- Incluir ABC-123, B4X-521, F6T-884 y los de citas (Yaris, Versa, Swift).
- 8–15 vehículos, todos con customerId del seed O-009.
- IDs estables.

## Out of Scope
- No service.
- No inspecciones.

## Expected Files
- src/mocks/vehicles/seed.ts

## Requirements
- Placas y modelos idénticos a `src/routes/index.tsx` donde existan.
- Sin huérfanos.

## Acceptance Criteria
- [x] Todas las placas del dashboard existen.
- [x] Cada vehículo apunta a un customerId válido.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/vehicles/seed.ts` (`vehicleSeed: Vehicle[]`, builder `vehicle`).
  - `src/mocks/vehicles/seed.test.ts` (nuevo).
- Features completed:
  - 12 vehículos con IDs `VEH-0001`… y placas canónicas del dashboard (`ABC-123` Toyota Corolla, `B4X-521` Kia Sportage, `F6T-884` Hyundai Tucson) más Yaris/Versa/Swift de citas.
  - Todos los `customerId` existen en `customerSeed` (sin huérfanos).
  - Sedes La Molina / Surco / San Miguel, combustibles y VIN válidos donde aplica.
- Tests:
  - `src/mocks/vehicles/seed.test.ts`: 4 tests (rango, placas dashboard, unicidad id/placa, integridad de dueño).
  - Suite completa: 84/84 pasan. `npm run typecheck` exit 0.
- Remaining issues:
  - Branch refs provisionales (`BR-LM/BR-SU/BR-SM`) hasta O-050; O-053 reconciliará.
  - Placas para vehículos sin placa en el dashboard inventadas con el formato peruano.
  - `npm run lint` global hereda el baseline Prettier; archivos de O-013 con 0 issues.
