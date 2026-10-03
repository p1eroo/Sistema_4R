# O-046 - Tipos y mock de caja / turno

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 6 — POS and payments

## Dependencies
O-044, O-005

## Goal
Sesión de caja: apertura 08:00, movimientos, cierre.

## Context
AppSidebar footer hardcodea caja abierta. Debe pasar a datos mock.

## Scope
- CashSession types/schemas.
- open/close/getCurrent.
- Seed sesión abierta 08:00 Sede La Molina.
- Tests.

## Out of Scope
- No UI de arqueo (C-033).
- No contabilidad.

## Expected Files
- src/domain/cash/types.ts
- src/mocks/cash/service.ts
- src/mocks/cash/seed.ts

## Requirements
- Una sesión abierta por sede.
- No cerrar dos veces.

## Acceptance Criteria
- [x] getCurrent('molina') devuelve turno 08:00.
- [x] close() deja sesión closed.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/cash/types.ts` (CashSession, CashMovement, estados, `cashMovementSign`, `sumCashMovements`).
  - `src/domain/cash/schemas.ts` (open/close/movimiento).
  - `src/domain/cash/index.ts` (barrel).
  - `src/mocks/cash/seed.ts` (sesión abierta La Molina 08:00 + sesión cerrada Surco).
  - `src/mocks/cash/service.ts` (`createCashService`, `cashService`).
  - `src/mocks/cash/service.test.ts` (nuevo).
- Features completed:
  - `getCurrent(branch)` (acepta slug `molina` o branchId), `open`, `close`, `addMovement`, `list`, `getById`.
  - Una sola sesión abierta por sede; no se cierra dos veces; no se agregan movimientos a sesión cerrada.
  - `expectedAmount`/`difference` calculados con movimientos firmados.
- Tests:
  - `service.test.ts`: 4 tests (turno 08:00, abrir + duplicado, cerrar, doble cierre/movimiento cerrado).
  - Suite completa: 266/266 pasan.
- Remaining issues:
  - UI de arqueo en C-033.
  - `npm run lint` global verde; archivos de O-046 con 0 issues.
