# O-055 - Resto de primitivos shadcn en glass

## Agent
OpenCode

## Status
TODO

## Priority
High

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-005

## Goal
Aplicar el patrón de CL-005 al resto de primitivos de `src/components/ui/`.

## Context
Rediseño visual completo con estética de vidrio hecha solo con CSS (`backdrop-filter` + fondo de degradados estático). Sin dependencias nuevas, sin WebGL, solo tema claro. La variante visual la elige el usuario en la vista previa (Paso 0 del plan). CL-005 deja el patrón documentado en CONVENTIONS.

## Scope
- `table`, `tabs`, `alert`, `badge`, `calendar`, `navigation-menu`, `drawer`, `accordion`, `textarea`, `checkbox`, `radio-group`, `switch`, `toggle`, `toggle-group`, `progress`, `skeleton`, `pagination`.

## Out of Scope
- No tocar `card`, `button`, `input`, `dialog`, `sheet` (CL-005), `sidebar.tsx` (CL-004) ni las capas flotantes ya hechas en CL-011: `popover`, `dropdown-menu`, `select`, `context-menu`, `menubar`, `hover-card`, `command`, `tooltip`.
- No cambiar lógica, datos, rutas ni textos de negocio.

## Expected Files
- src/components/ui/* (excepto los excluidos)

## Requirements
- No cambiar props ni comportamiento.
- `drawer` sigue el estilo de modal de CONVENTIONS §0 (blanco, opaco). `alert-dialog` ya está hecho (CL-011): no tocar.

## Acceptance Criteria
- [ ] Todos los primitivos listados siguen el patrón de CL-005.
- [ ] Sin cambios de API.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed:
- Features completed:
- Tests:
- Remaining issues:
