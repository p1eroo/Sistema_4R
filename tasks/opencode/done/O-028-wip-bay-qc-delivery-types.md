# O-028 - Tipos WIP, bahías, QC y entregas

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
O-022

## Goal
Modelar bahías, asignación WIP, control de calidad y entrega.

## Context
WIP/Kanban, bahías, QC y entregas son UX de Cursor; el modelo debe existir antes.

## Scope
- WorkshopBay, BayStatus, QualityCheck, Delivery, DeliveryChecklist.
- Relación bay ↔ workOrder.
- Resultado QC pass/fail con motivos.

## Out of Scope
- No services (O-029).
- No Kanban UI.

## Expected Files
- src/domain/workshop-ops/types.ts
- src/domain/workshop-ops/index.ts

## Requirements
- Bahías suficientes para 18 vehículos en taller (capacidad del dashboard ~76%).
- Estados de bahía: free, occupied, blocked.

## Acceptance Criteria
- [x] Tipos compilan.
- [x] QC referencia workOrderId.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/domain/workshop-ops/types.ts` (bahías, WIP/bay assignment, QC, entregas y catálogos).
  - `src/domain/workshop-ops/index.ts` (barrel).
  - `src/domain/workshop-ops/types.test.ts` (nuevo).
- Features completed:
  - `WorkshopBay`/`BayStatus` (free/occupied/blocked) y `BayAssignment` bay↔workOrder; capacidad `WORKSHOP_BAY_CAPACITY = 24` (18 = 76%).
  - `QualityCheck` con `result` pass/fail y `failureReasons`, ligado a `workOrderId`, checklist con catálogo estable.
  - `Delivery` con estados, checklist (`createDeliveryChecklist`) y datos de entrega.
- Tests:
  - `src/domain/workshop-ops/types.test.ts`: 4 tests.
  - Suite completa: 159/159 pasan.
- Remaining issues:
  - Services de operación de taller van en O-029.
  - `npm run lint` global verde; archivos de O-028 con 0 issues.
