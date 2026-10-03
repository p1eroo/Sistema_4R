# O-019 - Mock service de Reception

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 2 — Vehicle Reception

## Dependencies
O-017, O-018, O-005, O-010, O-014

## Goal
Crear/actualizar recepciones y listar las de hoy, usando clientes y vehículos reales del mock.

## Context
El dashboard dice «Nuevo vehículo recibido · Kia Sportage · B4X-521». Ese dato debe poder vivir en el service.

## Scope
- createDraft, updateStep, complete, list, getById.
- Seed de 2–4 recepciones incluyendo B4X-521.
- Tests.

## Out of Scope
- No generar WorkOrder todavía (O-024).
- No UI.

## Expected Files
- src/mocks/reception/seed.ts
- src/mocks/reception/service.ts
- src/mocks/reception/service.test.ts

## Requirements
- Validar contra O-018.
- complete() no crea OT en esta tarea.
- IDs estables.

## Acceptance Criteria
- [x] Se puede completar una recepción draft.
- [x] B4X-521 existe en seed.
- [x] test/typecheck pasan (0 errores en archivos de O-019).

## Verification
- npm run typecheck (ver Remaining issues: baseline cross-agente)
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/reception/seed.ts` (3 recepciones; incluye VEH-0003 = B4X-521).
  - `src/mocks/reception/service.ts` (`createReceptionService`, `receptionService`, `ReceptionService`, errores de dominio).
  - `src/mocks/reception/service.test.ts` (nuevo).
- Features completed:
  - `list`, `getById`, `createDraft`, `updateStep` (party/checklist), `complete` sobre O-005.
  - Validación con schemas de O-018; `complete` no crea OT (por diseño).
  - `updateStep` rechaza recepciones completadas/canceladas; avanza a in_progress.
  - Códigos `REC-<año>-000N` e IDs `RCP-000N` deterministas.
  - `parseOrThrow` genérico corregido para respetar defaults de Zod (`z.output`).
- Tests:
  - `src/mocks/reception/service.test.ts`: 8 tests (list, B4X-521, getById, createDraft+code, draft inválido, updateStep party→checklist, edición bloqueada, complete, sin motivo, not found).
  - Suite completa: 116/116 pasan.
- Remaining issues:
  - Persiste el conflicto cross-agente de typecheck (4 errores en `src/components/customers/*` de Cursor); O-019 no aporta errores.
  - `npm run lint` global hereda el baseline Prettier; archivos de O-019 con 0 issues.
