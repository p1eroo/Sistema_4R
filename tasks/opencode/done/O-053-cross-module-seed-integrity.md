# O-053 - Integridad de seeds cross-módulo

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 10 — Frontend integration and QA

## Dependencies
O-010, O-014, O-024, O-032, O-041, O-045, O-049

## Goal
Un seed root y tests que garanticen que no hay IDs huérfanos entre módulos.

## Context
Varios seeds se escribieron en paralelo. El prototipo se rompe si una OT apunta a un vehículo inexistente.

## Scope
- src/mocks/seed.ts que reexporte/compose.
- Tests de referential integrity.
- Corregir huérfanos sin cambiar UX.

## Out of Scope
- No UI.
- No nuevas features.

## Expected Files
- src/mocks/seed.ts
- src/mocks/seed.integrity.test.ts

## Requirements
- Toda OT tiene customer+vehicle existentes.
- Toda placa del dashboard resuelve.
- F001-00982 y OT-2026-0184 siguen existiendo.

## Acceptance Criteria
- [x] Integrity tests pasan.
- [x] No se eliminan entidades canónicas del dashboard.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/seed.ts` (root que reexporta todos los seeds).
  - `src/mocks/seed.integrity.test.ts` (nuevo).
  - `src/mocks/identity/seed.ts` (3 usuarios técnicos `TEC-0001..0003` para eliminar huérfanos de `technicianId`).
- Features completed:
  - Índice raíz de seeds y test de integridad referencial cross-módulo.
  - Verifica: vehículos→clientes, recepciones/inspecciones, OT/estimates/diagnósticos, citas/caja/POS, inventario, compras/catálogo, usuarios→roles/sedes, promociones→targets y operaciones de taller→OT.
  - Canonical: OT-2026-0184, F001-00982, placas ABC-123/B4X-521/F6T-884, slugs molina/surco/san-miguel y Carlos Mendoza siguen existiendo.
- Tests:
  - `seed.integrity.test.ts`: 10 tests. Suite completa: 285/285 pasan.
- Remaining issues:
  - Corregido huérfano real: `technicianId` apuntaba a `TEC-*` inexistentes; añadidos usuarios técnicos.
  - `npm run lint` global verde; archivos de O-053 con 0 issues.
