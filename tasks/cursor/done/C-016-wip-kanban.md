# C-016 - Tablero WIP / Kanban

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
C-013, O-029

## Goal
Kanban de trabajos en proceso por estado de OT, con drag o acciones de mover.

## Context
Usuario asignó WIP/Kanban a Cursor. Es la vista operativa del taller.

## Scope
- Ruta `/taller/wip`.
- Columnas = estados operativos.
- Cards con placa, modelo, tiempo.
- Mover card llama wip/OT service.

## Out of Scope
- No rediseñar como Jira.
- No bahías floor-plan (C-017).
- No QC form.

## Expected Files
- src/routes/taller/wip/index.tsx
- src/components/workshop/wip-board.tsx

## Requirements
- Tokens y StatusBadge existentes.
- Accesible si no hay drag (menú Mover a).
- No librería Kanban nueva si se puede con primitivos.

## Acceptance Criteria
- [x] Las 29 OT (o el seed real) se distribuyen como el pie chart.
- [x] Mover a Control actualiza el mock.
- [x] Vacío de columna tiene EmptyState.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/workshop/wip-board.tsx`
  - `src/routes/_erp/taller/wip/index.tsx`
- Features completed:
  - Kanban de 4 columnas (Diagnóstico / En reparación / Control / Listo) con StatusBadge y conteo.
  - Cards con código, placa, modelo y días en taller; clic abre el detalle de OT.
  - Select «Mover a» llama `wipService.moveStatus` con las transiciones de O-023.
  - EmptyState si una columna queda vacía.
- Tests:
  - `npm run typecheck`, Prettier y ESLint de los archivos C-016: OK. Sin helper extraíble.
  - Browser `/taller/wip`: seed 7 / 12 / 4 / 6 = 29. Mover OT-2026-0187 a Control → 7 / 11 / 5 / 6. Detalle confirma «Permitidos desde Control».
- Remaining issues:
  - Las 4 columnas del seed tienen cards; EmptyState no se ve en el camino feliz.
  - Sin drag-and-drop (menú accesible, sin librería Kanban).
