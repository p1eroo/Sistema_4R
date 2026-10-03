# O-020 - Tipos de inspección y mapa de daños

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 2 — Vehicle Reception

## Dependencies
O-017

## Goal
Modelar puntos de daño, vistas del vehículo y checklist de inspección.

## Context
Cursor hará el damage map (C-010). Necesita un modelo de zonas (frente, lateral, etc.) y severidad.

## Scope
- DamagePoint, DamageView, DamageSeverity, Inspection, InspectionStatus.
- Zonas predefinidas de un auto (vista 2D, no 3D).
- Notas y fotos como URLs mock.

## Out of Scope
- No componente SVG.
- No service (O-021).

## Expected Files
- src/domain/inspections/types.ts
- src/domain/inspections/zones.ts

## Requirements
- IDs de zona estables para pintar el mapa.
- Relación receptionId y/o vehicleId.

## Acceptance Criteria
- [x] Hay catálogo de zonas.
- [x] DamagePoint referencia zoneId + severity.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck (0 errores en archivos de O-020)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/inspections/zones.ts` (DamageView, 22 zonas 2D con id/posición, `zonesForView`, `findDamageZone`).
  - `src/domain/inspections/types.ts` (DamagePoint, DamageSeverity, Inspection, InspectionStatus, catálogo y helper de checklist).
  - `src/domain/inspections/index.ts` (barrel).
  - `src/domain/inspections/types.test.ts` (nuevo).
- Features completed:
  - Zonas estables por vista (frente, posterior, laterales, techo) con coordenadas % para el SVG de C-010.
  - `DamagePoint` referencia `zoneId` + `severity` + notas + fotos (URLs mock).
  - `Inspection` ligada a `receptionId` y `vehicleId`; checklist de inspección con IDs estables.
- Tests:
  - `src/domain/inspections/types.test.ts`: 5 tests (zonas por vista, unicidad/coords, find, labels de severidad, checklist).
  - Suite completa: 121/121 pasan.
- Remaining issues:
  - Sin componente SVG (Cursor C-010).
  - Persiste el conflicto cross-agente de typecheck (`src/components/customers/*` de Cursor).
  - `npm run lint` global hereda el baseline Prettier; archivos de O-020 con 0 issues.
