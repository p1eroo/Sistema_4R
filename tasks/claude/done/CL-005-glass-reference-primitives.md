# CL-005 - Primitivos de referencia en glass

## Agent
Claude

## Status
DONE

## Priority
Critical

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-003

## Goal
Rediseñar los primitivos base para que los módulos hereden el nuevo estilo y dejar el patrón que OpenCode replicará.

## Context
Rediseño visual completo con estética de vidrio hecha solo con CSS (`backdrop-filter` + fondo de degradados estático). Sin dependencias nuevas, sin WebGL, solo tema claro. La variante visual la elige el usuario en la vista previa (Paso 0 del plan). El sistema está centralizado: la mayoría de pantallas usa `Card`, `SectionCard` y `MetricCard`.

## Scope
- Nuevo primitivo `Surface` (niveles default/strong/subtle) en `src/components/erp/`.
- `Card`, `MetricCard`, `SectionCard`, `StatusBadge`, `Button`, `Input`, `Dialog`, `Sheet`, `ListToolbar` y data-states.
- Sección en CONVENTIONS con el patrón exacto para replicar en el resto de `ui/*`.

## Out of Scope
- No cambiar lógica, datos, rutas ni textos de negocio.
- Resto de primitivos shadcn (O-055).

## Expected Files
- src/components/erp/surface.tsx
- src/components/erp/dashboard-ui.tsx
- src/components/erp/data-states.tsx
- src/components/erp/list-toolbar.tsx
- src/components/ui/card.tsx
- src/components/ui/button.tsx
- src/components/ui/input.tsx
- src/components/ui/dialog.tsx
- src/components/ui/sheet.tsx

## Requirements
- No romper las APIs (props) existentes.
- Blur solo en superficies grandes; elementos repetidos sin blur.

## Acceptance Criteria
- [x] Las pantallas que usan estos primitivos cambian de estilo sin editarlas.
- [x] `Surface` documentado y con test básico.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed: `src/components/erp/surface.tsx`, `surface-class.ts`, `surface.test.ts` (nuevos), `dashboard-ui.tsx`, `data-states.tsx`, `list-toolbar.tsx`, `src/components/ui/{card,button,input,dialog,sheet}.tsx`
- Features completed: `Surface` con niveles default/strong/subtle; `Card` = `glass` (lo heredan `MetricCard`/`SectionCard`); botones e inputs con fondo translúcido sin blur; `Dialog` = `glass-strong`; `Sheet` con vidrio fuerte; overlay más suave. Patrón y receta de migración en CONVENTIONS §0. Sin cambios de props.
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores (10 warnings preexistentes); `npm run test` 76 archivos / 353 tests OK; `vite build` OK. Revisión visual con capturas de Chrome headless de `/` y `/pos`.
- Remaining issues: los módulos aún tienen superficies ad-hoc sin desenfoque (se ven translúcidas por los tokens); se migran en el rollout (O-055…O-061, CL-006…CL-009).
