# O-009 - Seed data de Customer

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
O-007

## Goal
Crear un padrón mock coherente con los nombres ya visibles en el dashboard.

## Context
El dashboard cita Lucía Ramos, Ana Torres, Luis Paredes, Rosa Huamán. Los seeds deben reutilizar esos nombres para que Phase 7 conecte el dashboard.

## Scope
- 12–20 clientes entre persona y empresa, sedes La Molina / Surco / San Miguel.
- Incluir los nombres del dashboard.
- IDs estables.

## Out of Scope
- No service.
- No UI.
- No vehículos (O-013).

## Expected Files
- src/mocks/customers/seed.ts

## Requirements
- Datos en español, teléfonos peruanos, documentos válidos respecto a O-007.
- Sin lógica de mutación.

## Acceptance Criteria
- [x] Seed exporta array tipado Customer[].
- [x] Incluye los 4 nombres del dashboard.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/customers/seed.ts` (`customerSeed: Customer[]`, builders `person` / `company`).
  - `src/mocks/customers/seed.test.ts` (nuevo).
- Features completed:
  - 12 clientes (9 persona + 3 empresa) en sedes La Molina / Surco / San Miguel.
  - Incluye Lucía Ramos, Ana Torres, Luis Paredes y Rosa Huamán del dashboard.
  - IDs estables `CUS-0001`…, DNI de 8 dígitos, RUC de 11, teléfonos peruanos, emails y direcciones.
  - `displayName` derivado con `customerDisplayName` de O-007. Sin lógica de mutación.
- Tests:
  - `src/mocks/customers/seed.test.ts`: 4 tests (rango, nombres, unicidad de id/documento, sede).
  - Suite completa: 63/63 pasan. `npm run typecheck` exit 0.
- Remaining issues:
  - Sede refs provisionales (`BR-LM/BR-SU/BR-SM`) hasta O-050 (branches mock); O-053 reconciliará.
  - `npm run lint` global hereda el baseline Prettier; archivos de O-009 con 0 issues.
