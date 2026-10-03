# C-010 - UI de mapa de daños

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 2 — Vehicle Reception

## Dependencies
C-008, O-021

## Goal
Inspección visual 2D: marcar daños por zona y severidad.

## Context
Usuario pidió explícitamente vehicle damage inspection. Es UX compleja de Cursor.

## Scope
- Mapa 2D (SVG o hotspots) usando zoneIds de O-020.
- Leyenda de severidad con tokens success/warning/critical.
- Persistir puntos con O-021.
- Usable en el paso Inspección del wizard.

## Out of Scope
- No motor 3D.
- No cámara real / upload a server.
- No rediseñar el wizard shell.

## Expected Files
- src/components/reception/damage-map.tsx
- src/components/reception/damage-legend.tsx

## Requirements
- Zonas clicables con accesibilidad (aria).
- No hardcodear zonas distintas a O-020.

## Acceptance Criteria
- [x] Marcar un rayón en zona frontal se guarda y se relee.
- [x] El mapa cabe en desktop y es usable en tablet.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/reception/damage-map.tsx`
  - `src/components/reception/damage-legend.tsx`
  - `src/components/reception/damage-severity.ts`
  - `src/components/reception/reception-inspection-step.tsx`
  - `src/components/reception/reception-wizard.tsx` (paso Inspección)
- Features completed:
  - Mapa 2D SVG con zonas O-020, clics accesibles y vistas Frente/Posterior/Laterales/Techo.
  - Leyenda leve/moderado/grave con tokens success/warning/critical.
  - Persistencia con `inspectionService.upsertDamagePoint` (O-021).
- Tests:
  - Lint de archivos de la tarea OK.
  - Browser: rayón leve en parachoques delantero se guarda y reaparece al volver del Checklist.
- Remaining issues:
  - Checklist de recepción en C-011. Fotos reales fuera de alcance.
