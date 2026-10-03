# C-011 - Checklist y notas de Recepción

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 2 — Vehicle Reception

## Dependencies
C-008, O-019, O-021

## Goal
Completar km, combustible, pertenencias, checklist y observaciones.

## Context
Complementa el damage map. Es el paso operativo antes de la revisión final.

## Scope
- Campos km, fuel level, pertenencias, checklist, notas.
- Persistencia draft O-019 / checklist O-021.
- Fotos como lista de URLs mock (sin backend).

## Out of Scope
- No mapa de daños.
- No cierre/OT.

## Expected Files
- src/components/reception/reception-checklist-step.tsx

## Requirements
- Controles UI existentes (Slider/Select/Checkbox/Textarea).
- Validación parcial O-018 si está exportada por steps.

## Acceptance Criteria
- [x] Se puede guardar el paso y recuperarlo.
- [x] Checklist vacío bloquea el cierre en UI (mensaje claro).

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/reception/reception-checklist-step.tsx`
  - `src/components/reception/reception-wizard.tsx` (paso Checklist)
- Features completed:
  - Km, combustible (slider 0–4), pertenencias, fotos URL mock, observaciones.
  - Checklist de ingreso + revisión de inspección persistidos con `updateStep("checklist")` y `saveChecklist`.
  - Alert “Checklist vacío” y Siguiente/Guardar bloqueados sin ítems.
- Tests:
  - Lint y typecheck de archivos de la tarea OK.
  - Browser: Alert vacío; km 48250 + Documentos + Luces + observaciones se guardan y reaparecen al volver del paso 4.
- Remaining issues:
  - Revisión y handoff a OT en C-012.
