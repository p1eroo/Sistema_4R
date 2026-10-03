# O-022 - Tipos de dominio Work Order

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
O-017

## Goal
Modelar OT: código, estados, vehicle/customer, asesor, técnico, fechas.

## Context
El dashboard usa OT-2026-0184 y estados Diagnóstico / En reparación / Control / Listo.

## Scope
- WorkOrder, WorkOrderStatus alineado al pie chart del dashboard.
- Código `OT-YYYY-NNNN`.
- receptionId, estimateId opcional, bayId opcional.
- WorkOrderListItem.

## Out of Scope
- No líneas de presupuesto (O-027).
- No UI.

## Expected Files
- src/domain/work-orders/types.ts
- src/domain/work-orders/status.ts

## Requirements
- Estados: diagnosis, in_repair, quality, ready, delivered, cancelled (mapear labels en español).
- IDs estables.

## Acceptance Criteria
- [x] El status set cubre el pie del dashboard.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/domain/work-orders/status.ts` (WorkOrderStatus, labels, activos, `isWorkOrderOpen`).
  - `src/domain/work-orders/types.ts` (WorkOrder, WorkOrderPriority, WorkOrderListItem, `buildWorkOrderCode`).
  - `src/domain/work-orders/index.ts` (barrel).
  - `src/domain/work-orders/status.test.ts` (nuevo).
- Features completed:
  - Estados diagnosis/in_repair/quality/ready/delivered/cancelled con labels del dashboard (Diagnóstico, En reparación, Control, Listo).
  - Código `OT-YYYY-NNNN` con `buildWorkOrderCode` → `OT-2026-0184`.
  - OT liga customer, vehicle, branch, advisor/técnico, reception/estimate/bay opcionales.
- Tests:
  - `src/domain/work-orders/status.test.ts`: 3 tests.
  - Suite completa: 131/131 pasan.
- Remaining issues:
  - Líneas de presupuesto van en O-027.
  - `npm run lint` global verde; archivos de O-022 con 0 issues.
