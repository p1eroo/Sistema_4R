# O-055 - Resto de primitivos shadcn en glass

## Agent
OpenCode

## Status
DONE

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
- Files changed: `src/components/ui/{table,tabs,alert,badge,calendar,navigation-menu,drawer,accordion,textarea,checkbox,radio-group,switch,toggle}.tsx`
- Features completed: Se aplicó el patrón Glass de CL-005 a los primitivos restantes. Tablas sobre superficies translúcidas planas con divisores `border-border/60`, hover `bg-white/40` y selección `bg-primary/5`. Tabs con pista `bg-white/40` y activo `bg-white`. Alert `bg-white/70`. Badge sin sombras. Calendar transparente sobre capas flotantes. Navigation menu con viewport `glass-float`. Drawer con estilo de modal (blanco opaco, `rounded-t-3xl`, overlay oscurecido con blur leve). Textarea `bg-white/70`. Checkbox/radio/switch/toggle sin sombras sueltas.
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores (10 warnings preexistentes); `npm run test` 76 archivos / 353 tests OK.
- Remaining issues: sin cambios de API. `progress`, `skeleton`, `pagination` y `toggle-group` ya cumplían el patrón y no requirieron cambios.

