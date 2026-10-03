# CL-004 - Shell glass: sidebar, header y page header

## Agent
Claude

## Status
DONE

## Priority
High

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-003

## Goal
Aplicar el vidrio al chrome compartido de la app.

## Context
Rediseño visual completo con estética de vidrio hecha solo con CSS (`backdrop-filter` + fondo de degradados estático). Sin dependencias nuevas, sin WebGL, solo tema claro. La variante visual la elige el usuario en la vista previa (Paso 0 del plan).

## Scope
- Sidebar, header sticky, flyout de navegación colapsada y cabecera de página con superficies glass.
- Estados activo/hover del menú coherentes con el nuevo estilo.

## Out of Scope
- No cambiar lógica, datos, rutas ni textos de negocio.
- No tocar `src/components/ui/sidebar.tsx` salvo clases de superficie.

## Expected Files
- src/components/erp/app-sidebar.tsx
- src/components/erp/app-header.tsx
- src/components/erp/collapsed-nav-flyout.tsx
- src/components/erp/page-header.tsx
- src/components/erp/module-page.tsx

## Requirements
- El header sticky debe seguir legible al hacer scroll sobre contenido.
- Navegación por teclado y foco visibles.

## Acceptance Criteria
- [x] Shell con glass en escritorio y móvil.
- [x] Tests de navegación existentes siguen pasando.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed: `src/components/ui/sidebar.tsx` (solo clases de superficie), `app-header.tsx`, `collapsed-nav-flyout.tsx`, `module-page.tsx`, `src/routes/index.tsx` (solo quitar `bg-background` del wrapper)
- Features completed: Sidebar con vidrio y desenfoque, header sticky `glass-bar`, flyout `glass-strong`, wrappers de página transparentes. `page-header.tsx` no necesitó cambios.
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores (10 warnings preexistentes); `npm run test` 76 archivos / 353 tests OK; `vite build` OK. Revisión visual con capturas de Chrome headless de `/` y `/pos`.
- Remaining issues: los módulos aún tienen superficies ad-hoc sin desenfoque (se ven translúcidas por los tokens); se migran en el rollout (O-055…O-061, CL-006…CL-009).
