# O-036 - Tipos y mock de Suppliers

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 4 — Products / Services / Suppliers

## Dependencies
O-002, O-005

## Goal
Proveedores con RUC, contacto y condiciones de pago.

## Context
Compras (Phase 5) depende de proveedores. El menú ya tiene el ítem.

## Scope
- Supplier types/schemas.
- Seed 5–8.
- CRUD mock + tests.

## Out of Scope
- No órdenes de compra (O-038).
- No UI (C-027).

## Expected Files
- src/domain/suppliers/types.ts
- src/domain/suppliers/schemas.ts
- src/mocks/suppliers/seed.ts
- src/mocks/suppliers/service.ts

## Requirements
- RUC schema O-004.
- Sede/contacto en español.

## Acceptance Criteria
- [x] CRUD funciona.
- [x] RUC inválido falla.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/suppliers/types.ts` (Supplier, SupplierStatus, PaymentTerms, SupplierContact, SupplierListItem).
  - `src/domain/suppliers/schemas.ts` (create/update reusando `rucSchema`, `phoneSchema`, `emailSchema`).
  - `src/domain/suppliers/index.ts` (barrel).
  - `src/mocks/suppliers/seed.ts`, `src/mocks/suppliers/service.ts`, `src/mocks/suppliers/service.test.ts`.
- Features completed:
  - Proveedores con RUC, contacto, teléfono/email, dirección y condición de pago.
  - CRUD + archive; RUC único y validado (rechaza inválido).
- Tests:
  - `service.test.ts`: 6 tests (list, getByRuc, create, RUC inválido, RUC duplicado, update/archive/not found).
  - Suite completa: 201/201 pasan.
- Remaining issues:
  - Órdenes de compra en O-038.
  - `npm run lint` global verde; archivos de O-036 con 0 issues.
