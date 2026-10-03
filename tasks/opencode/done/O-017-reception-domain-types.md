# O-017 - Tipos de dominio Reception

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 2 — Vehicle Reception

## Dependencies
O-007, O-011

## Goal
Modelar la recepción de vehículo: cabecera, checklist, km, combustible, pertenencias.

## Context
Recepción es el ingreso al taller. Cursor construirá un wizard; primero hace falta el modelo.

## Scope
- Reception, ReceptionStatus, FuelLevel, Belonging, ChecklistItem.
- Referencias customerId, vehicleId, branchId, advisorId.
- Campos: motivo, km, nivel combustible, observaciones.

## Out of Scope
- No damage points (O-020).
- No WorkOrder (O-022).
- No UI.

## Expected Files
- src/domain/reception/types.ts
- src/domain/reception/index.ts

## Requirements
- Estados: draft, in_progress, completed, cancelled.
- Reusar primitivos O-002.

## Acceptance Criteria
- [x] Tipos compilan.
- [x] Una recepción exige customer + vehicle.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/domain/reception/types.ts` (Reception, ReceptionStatus, FuelLevel, Belonging, ChecklistItem, catálogo, `createReceptionChecklist`, `isReceptionEditable`).
  - `src/domain/reception/index.ts` (barrel).
  - `src/domain/reception/types.test.ts` (nuevo).
- Features completed:
  - `Reception` con `customerId` y `vehicleId` obligatorios, `branchId` y `advisorId?`.
  - Estados draft/in_progress/completed/cancelled y `FuelLevel` (reserva→lleno).
  - Catálogo de checklist con IDs estables y pertenencias.
  - Reusa `EntityId`, `DateTimeIso` de O-002. Sin imports de UI.
- Tests:
  - `src/domain/reception/types.test.ts`: 3 tests (catálogo, marcado de items, editabilidad por estado).
  - Suite completa: 97/97 pasan. `npm run typecheck` exit 0.
- Remaining issues:
  - Sin catálogo de daños (O-020).
  - `npm run lint` global hereda el baseline Prettier; archivos de O-017 con 0 issues.
