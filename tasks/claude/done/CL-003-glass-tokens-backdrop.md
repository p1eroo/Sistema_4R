# CL-003 - Tokens y utilidades glass + fondo de degradados

## Agent
Claude

## Status
DONE

## Priority
Critical

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-002

## Goal
Crear los tokens y utilidades CSS del vidrio y el fondo estático de la app.

## Context
Rediseño visual completo con estética de vidrio hecha solo con CSS (`backdrop-filter` + fondo de degradados estático). Sin dependencias nuevas, sin WebGL, solo tema claro. La variante visual la elige el usuario en la vista previa (Paso 0 del plan).

## Scope
- Tokens en `:root` + `@theme inline` (oklch): `--glass-bg`, `--glass-bg-strong`, `--glass-border`, `--glass-highlight`, `--glass-blur`, `--glass-shadow`.
- Utilidades `@utility glass`, `glass-strong`, `glass-subtle`.
- Fondo de `radial-gradient` en capas, fijo, detrás del shell.
- Fallback sólido con `@supports not (backdrop-filter: blur(1px))` y `prefers-reduced-transparency`.

## Out of Scope
- No migrar componentes todavía.
- No modo oscuro.

## Expected Files
- src/styles.css
- src/components/erp/app-shell.tsx

## Requirements
- Colores solo en oklch.
- Sin animación ni canvas en el fondo.

## Acceptance Criteria
- [x] Las utilidades `glass*` existen y funcionan sobre el fondo.
- [x] Con blur no soportado o transparencia reducida, las superficies quedan sólidas y legibles.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed: `src/styles.css`
- Features completed: Tokens `--glass-*`, `--app-backdrop`, `--page`; utilidades `glass`, `glass-strong`, `glass-subtle`, `glass-bar`; fondo fijo en `body::before`; los tokens `--card`, `--background`, `--popover`, `--border`, `--muted`, `--sidebar` pasan a translúcidos (por eso los módulos heredan el estilo sin editarse); `--radius` 0.75rem; fallbacks para navegadores sin `backdrop-filter` y `prefers-reduced-transparency`. `app-shell.tsx` no necesitó cambios: el fondo vive en CSS.
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores (10 warnings preexistentes); `npm run test` 76 archivos / 353 tests OK; `vite build` OK. Revisión visual con capturas de Chrome headless de `/` y `/pos`.
- Remaining issues: los módulos aún tienen superficies ad-hoc sin desenfoque (se ven translúcidas por los tokens); se migran en el rollout (O-055…O-061, CL-006…CL-009).
