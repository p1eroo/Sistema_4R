# O-027 - Tipos y mock de Estimates

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
O-022, O-005

## Goal
Modelar presupuesto: líneas genéricas, totales, estados de aprobación.

## Context
Dashboard: 6 presupuestos pendientes · S/ 8,940. El catálogo de productos llega en Phase 4; las líneas pueden ser genéricas (kind, name, qty, unitPrice).

## Scope
- Estimate, EstimateLine, EstimateStatus (draft, pending_approval, approved, rejected, expired).
- Cálculo de totales (subtotal, descuento, IGV 18%, total) en helper puro.
- Service + seed que sume S/ 8,940 en pendientes.
- Tests de totales.

## Out of Scope
- No Estimate Builder UI (C-015).
- No catálogo real (Phase 4).

## Expected Files
- src/domain/estimates/types.ts
- src/domain/estimates/totals.ts
- src/domain/estimates/totals.test.ts
- src/mocks/estimates/service.ts
- src/mocks/estimates/seed.ts

## Requirements
- Money en céntimos.
- IGV configurable 18%.
- Líneas sin depender de ProductId todavía (productId opcional).

## Acceptance Criteria
- [x] Helper de totales testeado.
- [x] Pendientes suman 894000 céntimos.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/estimates/types.ts` (Estimate, EstimateLine, estados, `buildEstimateCode`).
  - `src/domain/estimates/totals.ts` (`calculateEstimateTotals`, IGV 18% configurable).
  - `src/domain/estimates/totals.test.ts`, `src/domain/estimates/index.ts`.
  - `src/mocks/estimates/seed.ts`, `src/mocks/estimates/service.ts`, `src/mocks/estimates/service.test.ts`.
- Features completed:
  - Totales puros (subtotal, descuento, IGV, total) en céntimos; el IGV se aplica sobre la base descontada.
  - Seed con 3 presupuestos `pending_approval` que suman **S/ 8,940.00 (894000 céntimos)**.
  - Service `list`, `listByStatus`, `getById`, `sumPendingApproval`, `create`, `updateStatus`; líneas con `productId` opcional.
- Tests:
  - `totals.test.ts` (5) + `service.test.ts` (5): 10 tests.
  - Suite completa: 171/171 pasan.
- Remaining issues:
  - Catálogo real de productos en Fase 4; `ProductId` opcional por ahora.
  - `npm run lint` global verde; archivos de O-027 con 0 issues.
