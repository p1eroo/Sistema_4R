# O-010 - Mock service de Customer

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
O-007, O-008, O-009, O-005

## Goal
CRUD + búsqueda de clientes sobre el repositorio in-memory.

## Context
C-004/C-005 y la recepción necesitan un service, no arrays locales en las páginas.

## Scope
- list, getById, create, update, archive, searchByDocOrName.
- Validar writes con schemas de O-008.
- Tests del service.

## Out of Scope
- No React Query hooks de UI.
- No página de clientes.
- No tocar seed de vehículos.

## Expected Files
- src/mocks/customers/service.ts
- src/mocks/customers/service.test.ts

## Requirements
- Usar kit O-005.
- Devolver copias.
- Errores de dominio tipados (NotFound, Validation).

## Acceptance Criteria
- [x] CRUD testeado.
- [x] Search encuentra por DNI y por nombre parcial.
- [x] typecheck/lint/test pasan (archivos propios).

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/customers/service.ts` (`createCustomerService`, `customerService`, `CustomerService`, `CustomerNotFoundError`, `CustomerValidationError`).
  - `src/mocks/customers/service.test.ts` (nuevo).
  - `src/domain/customers/types.ts` (ajuste compatible: campos opcionales con `| undefined` para `exactOptionalPropertyTypes` + Zod).
- Features completed:
  - `list`, `getById`, `create`, `update`, `archive`, `searchByDocOrName` sobre el kit O-005.
  - Writes validados con `customerCreateSchema` / `customerUpdateSchema` (O-008); errores tipados NotFound/Validation.
  - `displayName` se recalcula al cambiar tipo/nombres en update.
  - IDs `CUS-0013…` deterministas vía `idPrefix`.
- Tests:
  - `src/mocks/customers/service.test.ts`: 10 tests (list/paginación, search, getById, create + id, validación, update + displayName, not found, archive, búsqueda por DNI y por nombre).
  - Suite completa: 73/73 pasan. `npm run typecheck` exit 0.
- Remaining issues:
  - No valida unicidad de documento (fuera de alcance; no exigido).
  - `npm run lint` global hereda el baseline Prettier; archivos de O-010 con 0 issues.
