# O-062 - Tests de primitivos y guardia de superficies ad-hoc

## Agent
OpenCode

## Status
TODO

## Priority
Medium

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-005, O-056 a O-061

## Goal
Proteger el rediseño con tests.

## Context
Rediseño visual completo con estética de vidrio hecha solo con CSS (`backdrop-filter` + fondo de degradados estático). Sin dependencias nuevas, sin WebGL, solo tema claro. La variante visual la elige el usuario en la vista previa (Paso 0 del plan).

## Scope
- Tests de render de `Surface` y primitivos ERP.
- Test que recorra `src/**/*.tsx` y falle si aparece `border border-border bg-card` fuera de `Surface`.

## Out of Scope
- No modificar componentes para hacer pasar el test; reportar los casos encontrados.

## Expected Files
- src/components/erp/surface.test.tsx
- src/components/erp/glass-guard.test.ts

## Requirements
- Vitest en entorno node, como el resto del repo.

## Acceptance Criteria
- [ ] La guardia pasa con el código migrado.
- [ ] Falla de forma clara si se reintroduce una superficie ad-hoc.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed:
- Features completed:
- Tests:
- Remaining issues:
