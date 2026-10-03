# O-002 - Primitivos de dominio compartidos

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 0 — Foundation

## Dependencies
None

## Goal
Definir IDs, dinero, sucursal, usuario y timestamps usados por todos los módulos.

## Context
No hay capa `src/domain`. El dashboard hardcodea soles (`S/`), sedes (La Molina, Surco) y usuarios (Carlos Mendoza). Los mocks posteriores necesitan tipos comunes para no divergir.

## Scope
- Tipos: EntityId, Money (amount + currency PEN), BranchRef, UserRef, DateTimeIso, Pagination.
- Enums base: BranchStatus, RecordStatus.
- Helpers puros de formateo de dinero y fechas (es-PE) sin UI.

## Out of Scope
- No crear servicios ni seeds de negocio.
- No tocar componentes React.
- No definir aún Customer, Vehicle ni WorkOrder.

## Expected Files
- src/domain/shared/ids.ts
- src/domain/shared/money.ts
- src/domain/shared/branch.ts
- src/domain/shared/pagination.ts
- src/domain/shared/index.ts

## Requirements
- TypeScript estricto (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`).
- Dinero como entero en céntimos + currency, no float.
- IDs como branded strings o unions documentadas, no `any`.

## Acceptance Criteria
- [x] Los tipos compilan en isolation.
- [x] Hay helper `formatMoney` que produce `S/ 1,280.00`.
- [x] No hay imports desde `src/components` o `src/routes`.
- [x] typecheck pasa.

## Verification
- bun run lint (archivos propios)
- bun run typecheck
- bun run test

## Completion Report
- Files changed:
  - `src/domain/shared/ids.ts` (EntityId branded + `asEntityId` / `isEntityId`).
  - `src/domain/shared/money.ts` (Money en céntimos + `money`, `addMoney`, `multiplyMoney`, `formatMoney`).
  - `src/domain/shared/branch.ts` (enums `BranchStatus` / `RecordStatus`, `BranchRef`, `UserRef`, `DateTimeIso`, `nowIso`).
  - `src/domain/shared/pagination.ts` (`Pagination` + `createPagination`).
  - `src/domain/shared/index.ts` (barrel).
  - `src/domain/shared/money.test.ts` (nuevo).
- Features completed:
  - IDs branded (sin `any`), dinero entero en céntimos con currency PEN.
  - `formatMoney` produce `S/ 1,280.00`.
  - Refs compartidos de sede/usuario y enums base de estado.
- Tests:
  - `src/domain/shared/money.test.ts`: 4 tests (redondeo, formato PEN/0/negativo, add/multiply).
  - Suite completa: 7/7 pasan. `bun run typecheck` exit 0.
- Remaining issues:
  - `bun run lint` global sigue fallando por el baseline prettier preexistente de UI (745 issues, ver O-001). Los archivos de O-002 tienen 0 issues.
