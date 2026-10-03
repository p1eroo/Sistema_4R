# C-017 - UI de Bahías del taller

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
C-016, O-029

## Goal
Vista de bahías: ocupación, asignación de OT y bloqueo.

## Context
El objetivo del producto incluye Workshop Bays; el menú Lovable no lo tenía. C-002 debió añadir la ruta.

## Scope
- Ruta `/taller/bahias`.
- Grid de bahías con estado free/occupied/blocked.
- Asignar/liberar OT.

## Out of Scope
- No plano CAD.
- No IoT.
- No cambiar tipos O-028.

## Expected Files
- src/routes/taller/bahias/index.tsx
- src/components/workshop/bays-board.tsx

## Requirements
- Capacidad visual alineada a «18 vehículos · 76%».
- Reusar cards ERP.

## Acceptance Criteria
- [x] Se ve ocupación real del seed.
- [x] Asignar OT ocupa la bahía.
- [x] Bahía bloqueada no acepta OT.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/workshop/bays-board.tsx`
  - `src/components/workshop/bay-occupancy.ts`
  - `src/components/workshop/bay-occupancy.test.ts`
  - `src/routes/_erp/taller/bahias/index.tsx`
- Features completed:
  - Grid de 24 bahías con StatusBadge Libre/Ocupada/Bloqueada.
  - MetricCards al estilo dashboard: vehículos + % de capacidad.
  - Asignar OT, Liberar y Bloquear/Desbloquear vía `baysService`.
- Tests:
  - `bay-occupancy.test.ts` 2/2. Typecheck y ESLint OK.
  - Browser: seed 2 / 22 / 0 y 8%. Asignar OT-2026-0182 a BAY-03 → 3 ocupadas. Bloquear BAY-04 quita el select.
- Remaining issues:
  - El seed tiene 2 ocupadas (8%), no el «18 · 76%» del dashboard (C-034).
