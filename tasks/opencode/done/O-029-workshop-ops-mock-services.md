# O-029 - Mock services de operación de taller

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
O-028, O-024, O-005

## Goal
Services de bahías, movimiento WIP, QC y entregas + seeds coherentes.

## Context
C-016 a C-022 consumen estos services. Deben mover el status de la OT vía O-024, no duplicar estados.

## Scope
- baysService, wipService, qualityService, deliveryService.
- Seeds: bahías, OT asignadas, 1 QC pendiente (OT-2026-0184), entregas de hoy (ABC-123 11:30, F6T-884 14:00, B4X-521 16:30).
- Tests de asignación y QC fail → back to repair.

## Out of Scope
- No UI Kanban/QC.
- No redefinir WorkOrderStatus.

## Expected Files
- src/mocks/workshop-ops/*.ts

## Requirements
- Cambios de estado delegan en O-024.
- Seeds alineados al bloque «Vehículos listos pronto».

## Acceptance Criteria
- [x] OT-2026-0184 está en quality.
- [x] Las 3 entregas de hoy existen.
- [x] Tests de transición QC pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/workshop-ops/seed.ts` (24 bahías, QC de 0184, 3 entregas de hoy).
  - `src/mocks/workshop-ops/bays-service.ts` (`baysService`, `wipService`).
  - `src/mocks/workshop-ops/quality-service.ts` (`qualityService`).
  - `src/mocks/workshop-ops/delivery-service.ts` (`deliveryService`).
  - `src/mocks/workshop-ops/workshop-ops.test.ts` (nuevo).
- Features completed:
  - Bahías (24, 2 ocupadas) con assign/release/setStatus; WIP `getBoard` agrupado por estado y `moveStatus` delegando en O-024.
  - QC `record` que delega: pass → `Ready`, fail → `InRepair`, con motivos; seed QC de OT-2026-0184.
  - Entregas de hoy (ABC-123 11:30, F6T-884 14:00, B4X-521 16:30); `markDelivered` cierra la OT vía O-024.
- Tests:
  - `workshop-ops.test.ts`: 7 tests (bahías seed/assign/release, board+moveStatus, QC 0184, QC pass/fail, entregas de hoy, markDelivered).
  - Suite completa: 178/178 pasan.
- Remaining issues:
  - `markDelivered` exige una OT lista (transición válida); las entregas seed apuntan a OT no listas por diseño del mock.
  - `npm run lint` global verde; archivos de O-029 con 0 issues.
