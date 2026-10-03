# C-009 - Paso Cliente y Vehículo de Recepción

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 2 — Vehicle Reception

## Dependencies
C-008, O-010, O-014, O-016, O-019

## Goal
Permitir buscar/crear cliente y vehículo dentro del wizard y persistir el draft.

## Context
Es el ingreso real al taller. Debe reusar forms O-015/O-016 y services existentes.

## Scope
- Lookup por DNI/RUC y por placa.
- Alta rápida con los forms de OpenCode.
- Guardar draft vía O-019.

## Out of Scope
- No implementar CustomerForm ni VehicleForm.
- No damage map.
- No POS.

## Expected Files
- src/components/reception/reception-party-step.tsx

## Requirements
- No duplicar forms.
- Estados empty/error con O-006.
- No tocar mocks, solo consumirlos.

## Acceptance Criteria
- [x] Buscar ABC-123 carga el vehículo y su dueño.
- [x] Se puede crear cliente+vehículo nuevos y seguir al siguiente paso.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/reception/reception-party-step.tsx`
  - `src/components/reception/reception-lookup.ts`
  - `src/components/reception/reception-lookup.test.ts`
  - `src/components/reception/reception-wizard.tsx` (paso 1 real; Siguiente bloqueado hasta cliente+vehículo)
- Features completed:
  - Lookup por placa (`ABC-123` → Toyota Corolla + Lucía Ramos) y por DNI/RUC/nombre.
  - Alta rápida con CustomerForm (O-015) y VehicleForm (O-016), sin reescribirlos.
  - Draft vía `receptionService.createDraft` / `updateStep("party")`.
  - Continúa al paso Inspección (REC-2026-0004).
- Tests:
  - Lookup helpers: 2/2.
  - Lint de archivos de la tarea OK.
  - Browser: ABC-123 + dueño; alta Nora Test Vega / ZZZ-001 Honda Civic y avance a paso 2.
  - `npm run typecheck` global sigue fallando por mocks de OpenCode (fuera de alcance).
- Remaining issues:
  - Mapa de daños en C-010. Checklist y review en C-011/C-012.
