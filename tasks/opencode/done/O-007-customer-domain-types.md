# O-007 - Tipos de dominio Customer

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
O-002

## Goal
Modelar el cliente del taller (persona/empresa, documentos, contacto, sede).

## Context
El dashboard menciona clientes (Lucía Ramos, Ana Torres). No hay tipos. Clientes es la base de recepción, OT, POS e historial.

## Scope
- Customer, CustomerType (persona/empresa), DocumentType (DNI/RUC/CE), CustomerStatus.
- Dirección, teléfonos, email, sede preferida, notas.
- CustomerListItem para tablas.

## Out of Scope
- No schemas Zod (O-008).
- No seed ni service.
- No UI.

## Expected Files
- src/domain/customers/types.ts
- src/domain/customers/index.ts

## Requirements
- Reusar Money/BranchRef/EntityId de O-002.
- Campos alineados a un taller peruano (DNI/RUC).
- Sin `any`.

## Acceptance Criteria
- [x] Tipos exportados y compilables.
- [x] No imports de UI.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/domain/customers/types.ts` (Customer, CustomerType, DocumentType, CustomerStatus, CustomerPhone, CustomerAddress, CustomerListItem, `customerDisplayName`).
  - `src/domain/customers/index.ts` (barrel).
  - `src/domain/customers/types.test.ts` (nuevo).
- Features completed:
  - Cliente persona/empresa con documento DNI/RUC/CE, teléfonos, email, dirección, sede preferida y notas.
  - `CustomerListItem` para tablas.
  - Helper `customerDisplayName` para persona (`Lucía Ramos`) y empresa (razón social).
  - Reusa `EntityId`, `BranchRef`, `DateTimeIso` de O-002. Sin `any`, sin imports de UI.
- Tests:
  - `src/domain/customers/types.test.ts`: 3 tests.
  - Suite completa: 50/50 pasan. `npm run typecheck` exit 0.
- Remaining issues:
  - `npm run lint` global sigue con el baseline Prettier heredado (fuera del ownership de OpenCode); los archivos de O-007 tienen 0 issues con `npx eslint`.
