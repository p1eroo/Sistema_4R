# C-008 - Shell del wizard de Recepción

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 2 — Vehicle Reception

## Dependencies
C-002, C-003

## Goal
Construir el esqueleto UX del flujo de recepción (pasos, progreso, navegación) sin lógica de negocio completa.

## Context
Recepción es el flujo más complejo del prototipo. El shell debe existir antes de los pasos.

## Scope
- Ruta `/taller/recepcion` (nueva y, si aplica, `/$id` para draft).
- Stepper: Cliente/Vehículo → Inspección → Checklist → Revisión.
- Layout de wizard usando tokens y chrome existentes.
- Slots vacíos por paso.

## Out of Scope
- No damage map (C-010).
- No lookup real (C-009).
- No crear OT (C-012).
- No rediseñar el producto.

## Expected Files
- src/routes/taller/recepcion/index.tsx
- src/components/reception/reception-wizard.tsx

## Requirements
- No usar un kit de wizard externo si se puede con Tabs/steps propios.
- Español.
- AppShell obligatorio.

## Acceptance Criteria
- [x] El stepper se ve y navega entre placeholders.
- [x] Back/next no rompe estado local.
- [x] Visual alineado al dashboard.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/reception/reception-wizard.tsx`
  - `src/routes/_erp/taller/recepcion/index.tsx` (ruta real; no se creó `src/routes/taller/...` para no chocar con `_erp`)
- Features completed:
  - Stepper de 4 pasos: Cliente/vehículo → Inspección → Checklist → Revisión.
  - Slots vacíos, Atrás/Siguiente, salto por clic en el paso.
  - Usa ModulePage, SectionCard y tokens existentes. Sin kit de wizard externo.
- Tests:
  - `npm run typecheck` pasa.
  - Lint de archivos de la tarea pasa.
  - Browser: paso 1→2 con Siguiente, salto a Revisión, Atrás a Checklist. Atrás deshabilitado en el primero; Siguiente deshabilitado en el último.
- Remaining issues:
  - Sin lookup, damage map ni creación de OT (C-009/C-010/C-011/C-012).
  - No se añadió `/$id` de draft: no hay mock de recepción (O-019).
