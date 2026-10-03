# O-018 - Schemas Zod de Reception

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 2 — Vehicle Reception

## Dependencies
O-017, O-004

## Goal
Validar el payload de recepción por pasos (cliente/vehículo, checklist, cierre).

## Context
El wizard de Cursor validará cada step; los schemas deben poder usarse por parte.

## Scope
- Schemas parciales por step + schema de cierre.
- Tests.

## Out of Scope
- No UI wizard.
- No damage schema (O-020).

## Expected Files
- src/domain/reception/schemas.ts
- src/domain/reception/schemas.test.ts

## Requirements
- Mensajes en español.
- km >= 0.
- Steps independientes combinables.

## Acceptance Criteria
- [x] No se puede completar recepción sin customerId/vehicleId.
- [x] Tests pasan.

## Verification
- npm run typecheck (0 errores en archivos de O-018; ver Remaining issues)
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/reception/schemas.ts` (schemas por step + `receptionCompleteSchema` + `receptionDraftSchema`).
  - `src/domain/reception/schemas.test.ts` (nuevo).
- Features completed:
  - `receptionStepPartySchema` (customerId, vehicleId, branchId obligatorios + advisorId + reason).
  - `receptionStepChecklistSchema` (km ≥ 0, combustible, pertenencias, checklist, observaciones).
  - `receptionCompleteSchema` merge de ambos: no se puede completar sin customerId/vehicleId.
  - `receptionDraftSchema` para borradores (exige customer/vehicle, resto opcional).
  - IDs de checklist validados contra el catálogo de O-017. Mensajes en español.
- Tests:
  - `src/domain/reception/schemas.test.ts`: 6 tests (completa válida, sin customer/vehicle, km negativo/motivo vacío, ítem fuera de catálogo, step independiente, draft).
  - Suite completa: 106/106 pasan.
- Remaining issues:
  - **Conflicto cross-agente**: `npm run typecheck` global falla con 4 errores en archivos de Cursor (`src/components/customers/customer-list.tsx` y `customer-list-filters.test.ts` usan `documentType: "DNI"` literal en vez de `DocumentType.DNI`). No hay errores en `src/domain/reception/**`. No toco archivos de Cursor; requiere que Cursor lo corrija.
  - `npm run lint` global hereda el baseline Prettier; archivos de O-018 con 0 issues.
