# O-021 - Mock service de Inspection

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 2 — Vehicle Reception

## Dependencies
O-020, O-005, O-019

## Goal
CRUD de inspecciones y puntos de daño asociados a una recepción.

## Context
C-010/C-011/C-018 consumen este service. Debe permitir upsert de puntos por zona.

## Scope
- getByReception, upsertDamagePoint, removeDamagePoint, saveChecklist, seed 1–2 inspecciones.
- Tests.

## Out of Scope
- No UI del mapa.
- No QC de Phase 3.

## Expected Files
- src/mocks/inspections/seed.ts
- src/mocks/inspections/service.ts
- src/mocks/inspections/service.test.ts

## Requirements
- Usar zonas de O-020.
- No mutar reception service salvo IDs.

## Acceptance Criteria
- [x] Se pueden marcar 3 daños en una recepción.
- [x] Tests pasan.

## Verification
- npm run typecheck (0 errores en archivos de O-021; ver Remaining issues)
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/inspections/seed.ts` (2 inspecciones ligadas a RCP-0001/RCP-0002).
  - `src/mocks/inspections/service.ts` (`createInspectionService`, `inspectionService`, `InspectionService`, errores de dominio).
  - `src/mocks/inspections/service.test.ts` (nuevo).
- Features completed:
  - `list`, `getById`, `getByReception`, `upsertDamagePoint`, `removeDamagePoint`, `saveChecklist`.
  - `getOrCreate` crea la inspección a partir de la recepción (lee `vehicleId` del reception service, sin mutarlo).
  - Upsert por zona: no duplica, actualiza severidad/notas/fotos; IDs `DMP-000N` deterministas.
  - Checklist validado contra el catálogo de O-020.
- Tests:
  - `src/mocks/inspections/service.test.ts`: 7 tests (list, getById/getByReception, marcar 3 daños, upsert idempotente, zona/recepción inválidas, remove + unknown, saveChecklist).
  - Suite completa: 128/128 pasan.
- Remaining issues:
  - `saveChecklist` deja la inspección en in_progress; no hay `complete()` (no solicitado).
  - Persiste el conflicto cross-agente de typecheck (`src/components/customers/*` de Cursor).
  - `npm run lint` global hereda el baseline Prettier; archivos de O-021 con 0 issues.
