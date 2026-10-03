# O-008 - Schemas Zod de Customer

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
O-007, O-004

## Goal
Validar alta/edición de clientes con mensajes en español.

## Context
react-hook-form + Zod ya están listos; falta el schema de cliente para el form simple (O-015).

## Scope
- customerCreateSchema / customerUpdateSchema.
- Refinar tipos con z.infer alineados a O-007.
- Tests de DNI/RUC y campos requeridos.

## Out of Scope
- No UI.
- No mock service.

## Expected Files
- src/domain/customers/schemas.ts
- src/domain/customers/schemas.test.ts

## Requirements
- Reusar schemas de documento/teléfono/email de O-004.
- Errores en español.

## Acceptance Criteria
- [x] Parse ok/fail cubierto por tests.
- [x] Tipos inferidos no divergen de O-007.
- [x] test + typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/customers/schemas.ts` (`customerObjectSchema`, `customerCreateSchema`, `customerUpdateSchema`, `CustomerCreateValues`, `CustomerUpdateValues`).
  - `src/domain/customers/schemas.test.ts` (nuevo).
- Features completed:
  - Reusa `dniSchema`, `rucSchema`, `phoneSchema`, `emailSchema` de O-004.
  - `customerCreateSchema` valida documento según tipo (DNI 8 / RUC 11 / CE 9-12), exige nombres para persona y razón social + RUC para empresa, y al menos un teléfono.
  - `customerUpdateSchema` = parcial para edición.
  - `entityIdSchema` con `z.custom<EntityId>` mantiene el branded type de O-002.
  - Errores en español.
- Tests:
  - `src/domain/customers/schemas.test.ts`: 8 tests (persona, empresa, DNI inválido, campos faltantes, empresa con DNI, teléfonos, update parcial).
  - Suite completa: 59/59 pasan. `npm run typecheck` exit 0.
- Remaining issues:
  - CE no tiene dígito verificador; solo formato/longitud.
  - `npm run lint` global hereda el baseline Prettier; archivos de O-008 con 0 issues.
