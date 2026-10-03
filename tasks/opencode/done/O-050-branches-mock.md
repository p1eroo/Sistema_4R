# O-050 - Tipos y mock de Sedes

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 9 — Users / Branches / Settings

## Dependencies
O-002, O-005

## Goal
Sedes La Molina, Surco, San Miguel como datos, no strings sueltos.

## Context
Header y dashboard hardcodean sedes. Inventory/POS ya las usaron como ids; esta tarea es la fuente canónica.

## Scope
- Branch types/schemas.
- Seed 3 sedes.
- Service list/get/update.
- Tests.

## Out of Scope
- No UI sedes (O-052/C-038).
- No redibujar header (C-040).

## Expected Files
- src/domain/branches/types.ts
- src/mocks/branches/seed.ts
- src/mocks/branches/service.ts

## Requirements
- IDs molina/surco/san-miguel alineados a C-002/O-002.
- La Molina es default.

## Acceptance Criteria
- [x] list() devuelve 3 sedes.
- [x] typecheck/test pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/branches/types.ts` (Branch, BranchListItem).
  - `src/domain/branches/schemas.ts` (update/create).
  - `src/domain/branches/index.ts` (barrel).
  - `src/mocks/branches/seed.ts` (3 sedes), `src/mocks/branches/service.ts`, `src/mocks/branches/service.test.ts`.
- Features completed:
  - Fuente canónica de sedes con `id` (`BR-LM/BR-SU/BR-SM`), `slug` (`molina/surco/san-miguel`), nombre, dirección, teléfono, capacidad y `isDefault`.
  - La Molina es default. `list`, `getById`, `getBySlug`, `getDefault`, `update` (default único).
- Tests:
  - `service.test.ts`: 4 tests (3 sedes, default La Molina, slug, update/not found).
  - Suite completa: 275/275 pasan.
- Remaining issues:
  - Los ids canónicos usados por el resto de mocks son `BR-*`; los slugs `molina/surco/san-miguel` cubren el requerimiento.
  - `npm run lint` global verde; archivos de O-050 con 0 issues.
