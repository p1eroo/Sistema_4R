# O-024 - Mock service de Work Order

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
O-022, O-023, O-005, O-019

## Goal
CRUD de OT, listado por estado y creación desde recepción completada.

## Context
C-012, C-013, C-014 y el dashboard dependen de este service. Seeds deben incluir OT-2026-0184 y las pendientes del dashboard.

## Scope
- createFromReception, list, getById, updateStatus, update.
- Seed: OT-2026-0184 (quality), 0187 (repuesto), 0182 (aprobación), 0178 (pago), más para llenar el pie 7/12/4/6.
- Tests.

## Out of Scope
- No UI.
- No estimate builder.

## Expected Files
- src/mocks/work-orders/seed.ts
- src/mocks/work-orders/service.ts
- src/mocks/work-orders/service.test.ts

## Requirements
- Códigos exactos del dashboard donde existan.
- createFromReception falla si reception no está completed.

## Acceptance Criteria
- [x] Conteos por estado pueden alimentar el pie chart.
- [x] Tests cubren createFromReception y transición ilegal.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/work-orders/seed.ts` (29 OTs; OT-2026-0184/0187/0182/0178 canónicas; conteos 7/12/4/6).
  - `src/mocks/work-orders/service.ts` (`createWorkOrderService`, `workOrderService`, errores de dominio).
  - `src/mocks/work-orders/service.test.ts` (nuevo).
- Features completed:
  - `list`, `listByStatus`, `countByStatus`, `getById`, `createFromReception`, `update`, `updateStatus`.
  - `createFromReception` exige recepción `completed` (si no, ValidationError) y hereda customer/vehicle/branch/km.
  - `updateStatus` valida transiciones (O-023) y fija `closedAt` al entregar.
  - Códigos `OT-YYYY-NNNN` correlativos; IDs `WO-YYYY-NNNN`; conteos exactos del dashboard.
- Tests:
  - `src/mocks/work-orders/service.test.ts`: 11 tests (conteos, list, 0184, filtro, createFromReception ok/no-completada/inexistente, transición válida/ilegal, id desconocido, update).
  - Suite completa: 147/147 pasan.
- Remaining issues:
  - Sin estados sub-orden (repuesto/aprobación/pago) modelados; el dashboard los mapea a status base.
  - `npm run lint` global verde; archivos de O-024 con 0 issues.
