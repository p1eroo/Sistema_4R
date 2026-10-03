# O-026 - Tipos y mock de Diagnostics

## Agent
OpenCode

## Status
DONE

## Priority
Medium

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
O-022, O-005

## Goal
Modelar diagnóstico técnico ligado a una OT (hallazgos, códigos, recomendación).

## Context
El menú tiene Diagnósticos y el pie chart tiene slice Diagnóstico.

## Scope
- Diagnostic types/schemas.
- Service getByWorkOrder, upsert.
- Seed 2–3.
- Tests.

## Out of Scope
- No UI (C-019).
- No estimate lines.

## Expected Files
- src/domain/diagnostics/types.ts
- src/domain/diagnostics/schemas.ts
- src/mocks/diagnostics/service.ts
- src/mocks/diagnostics/seed.ts

## Requirements
- workOrderId requerido.
- Hallazgos como lista tipada.

## Acceptance Criteria
- [x] Una OT en diagnosis tiene diagnóstico seed.
- [x] typecheck/test pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/diagnostics/types.ts` (Diagnostic, DiagnosticFinding, estados, severidad).
  - `src/domain/diagnostics/schemas.ts` (create/update; `workOrderId` requerido, ≥1 hallazgo).
  - `src/domain/diagnostics/index.ts` (barrel).
  - `src/mocks/diagnostics/seed.ts` (3 diagnósticos), `src/mocks/diagnostics/service.ts`, `src/mocks/diagnostics/service.test.ts`.
- Features completed:
  - Diagnóstico ligado a OT con hallazgos tipados (código, severidad, recomendación).
  - `list`, `getById`, `getByWorkOrder`, `upsert` (crea/actualiza por OT; IDs de hallazgo `DGF-000N` deterministas).
  - Seed: WO-2026-0182 (diagnosis) tiene diagnóstico completado.
- Tests:
  - `service.test.ts`: 5 tests.
  - Suite completa: 206/206 pasan.
- Remaining issues:
  - Sin UI (C-019).
  - `npm run lint` global verde; archivos de O-026 con 0 issues.
