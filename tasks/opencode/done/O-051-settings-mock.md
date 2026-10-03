# O-051 - Tipos y mock de Settings

## Agent
OpenCode

## Status
DONE

## Priority
Medium

## Phase
PHASE 9 — Users / Branches / Settings

## Dependencies
O-002, O-005

## Goal
Configuración de empresa, IGV, numeración de OT/facturas y preferencias UI.

## Context
El menú tiene Configuración. El prototipo necesita valores (IGV 18%, serie F001, prefijo OT-2026).

## Scope
- Settings types.
- get/update mock.
- Seed empresa 4 RUEDAS Mecánica Automotriz.
- Tests de update parcial.

## Out of Scope
- No UI (C-039).
- No theme nuevo.

## Expected Files
- src/domain/settings/types.ts
- src/mocks/settings/service.ts
- src/mocks/settings/seed.ts

## Requirements
- igvRate = 0.18.
- documentSeries F001.
- No secrets.

## Acceptance Criteria
- [x] get() devuelve empresa 4 RUEDAS.
- [x] update cambia IGV y se relee.
- [x] typecheck/test pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/settings/types.ts` (AppSettings, Company/Tax/Document/Ui + SettingsPatch).
  - `src/domain/settings/index.ts` (barrel).
  - `src/mocks/settings/seed.ts` (empresa 4 RUEDAS, IGV 0.18, serie F001, OT 2026).
  - `src/mocks/settings/service.ts` (`createSettingsService`, `settingsService`).
  - `src/mocks/settings/service.test.ts` (nuevo).
- Features completed:
  - `get()` y `update(patch)` con merge parcial por sección; validación de IGV 0–1.
  - Sin secretos.
- Tests:
  - `service.test.ts`: 3 tests (empresa, update parcial + relectura, IGV inválido).
  - Suite completa: 294/294 pasan.
- Remaining issues:
  - UI de configuración en C-039.
  - `npm run lint` global verde; archivos de O-051 con 0 issues.
