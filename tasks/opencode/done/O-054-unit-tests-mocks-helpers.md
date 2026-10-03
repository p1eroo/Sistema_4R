# O-054 - Tests unitarios de helpers y mocks críticos

## Agent
OpenCode

## Status
DONE

## Priority
Medium

## Phase
PHASE 10 — Frontend integration and QA

## Dependencies
O-001, O-005, O-053

## Goal
Cerrar huecos de test en totals, transiciones, stock, pagos y can().

## Context
Varias tareas ya pidieron tests; esta cubre regresiones transversales.

## Scope
- Suite extra para money, transitions, inventory, POS pay, RBAC.
- No tests E2E browser.

## Out of Scope
- No Playwright.
- No cambiar UI.

## Expected Files
- src/**/*.test.ts (solo añadir/ajustar tests)
- package.json (solo si falta script)

## Requirements
- No bajar cobertura de casos canónicos del dashboard.
- Tests deterministas.

## Acceptance Criteria
- [x] npm run test pasa en limpio.
- [x] Casos canónicos documentados en los nombres de test.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed:
  - `src/lib/regression.test.ts` (nuevo, suite de regresión transversal).
- Features completed:
  - Cubre money (`S/ 1,280.00`), estimates (pendientes `S/ 8,940.00`), slices de OT `7/12/4/6`, transiciones, stock crítico (7) y pastillas (2), RBAC de Carlos y cobro POS con descuento de stock.
  - Nombres de test documentan cada caso canónico del dashboard.
- Tests:
  - `regression.test.ts`: 6 tests. Suite completa: **301/301 pasan** (57 archivos).
- Remaining issues:
  - Sin tests E2E browser (fuera de alcance).
  - `npm run lint` global verde; el archivo de O-054 con 0 issues.
