# O-033 - Tipos y mock de Servicios

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 4 — Products / Services / Suppliers

## Dependencies
O-002, O-004, O-005

## Goal
Catálogo de mano de obra: mantenimiento preventivo, aceite, frenos, diagnóstico.

## Context
Ranking del dashboard usa esos 4 servicios.

## Scope
- ServiceItem types/schemas.
- Seed de los 4 + extras.
- CRUD mock + tests.

## Out of Scope
- No UI (C-025).
- No promociones (O-035).

## Expected Files
- src/domain/services/types.ts
- src/domain/services/schemas.ts
- src/mocks/services/seed.ts
- src/mocks/services/service.ts

## Requirements
- Duración estimada en minutos.
- Precio céntimos.

## Acceptance Criteria
- [x] Los 4 servicios del ranking existen.
- [x] typecheck/test pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/services/types.ts` (ServiceItem, ServiceCategory, ServiceStatus, labels).
  - `src/domain/services/schemas.ts` (create/update, precio no negativo, duración ≥ 15).
  - `src/domain/services/index.ts` (barrel).
  - `src/mocks/services/seed.ts` (6 servicios, incluidos los 4 del ranking).
  - `src/mocks/services/service.ts` (`createServiceCatalog`, `serviceCatalog`).
  - `src/mocks/services/service.test.ts` (nuevo).
- Features completed:
  - Catálogo de mano de obra con duración estimada y precio en céntimos.
  - CRUD + `archive`; código único (normalizado a mayúsculas) validado en create/update.
- Tests:
  - `service.test.ts`: 5 tests (ranking, getByCode, create+normalización, duplicado/precio negativo, update/archive/not found).
  - Suite completa: 190/190 pasan.
- Remaining issues:
  - Sin promociones (O-035).
  - `npm run lint` global verde; archivos de O-033 con 0 issues.
