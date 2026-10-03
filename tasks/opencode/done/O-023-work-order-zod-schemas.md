# O-023 - Schemas Zod de Work Order

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
O-022, O-004

## Goal
Validar creación/actualización y transiciones de estado permitidas.

## Context
El detalle de OT y el Kanban cambiarán estados; las transiciones inválidas deben fallar en schema/helper.

## Scope
- create/update schemas.
- Helper de transición de status + tests.

## Out of Scope
- No Kanban UI.
- No estimate lines.

## Expected Files
- src/domain/work-orders/schemas.ts
- src/domain/work-orders/transitions.ts
- src/domain/work-orders/transitions.test.ts

## Requirements
- No saltar de diagnosis a delivered.
- Mensajes en español.

## Acceptance Criteria
- [x] Transiciones ilegales fallan.
- [x] Tests pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/work-orders/schemas.ts` (create/update/status schemas).
  - `src/domain/work-orders/transitions.ts` (mapa de transiciones + `canTransitionWorkOrder` + `assertWorkOrderTransition` + error tipado).
  - `src/domain/work-orders/transitions.test.ts` (nuevo).
- Features completed:
  - `workOrderCreateSchema` (customer/vehicle/branch obligatorios, prioridad, km ≥ 0, promisedAt ISO vía O-004) y `workOrderUpdateSchema` parcial.
  - `workOrderStatusUpdateSchema`.
  - Transiciones válidas diagnosis→in_repair→quality→ready→delivered (+ retrocesos controlados y cancelación); no permite diagnosis→delivered.
  - Error con mensaje en español.
- Tests:
  - `src/domain/work-orders/transitions.test.ts`: 5 tests.
  - Suite completa: 136/136 pasan.
- Remaining issues:
  - Sin tests dedicados de schemas (lógica declarativa; cubierta por el service en O-024).
  - `npm run lint` global verde; archivos de O-023 con 0 issues.
