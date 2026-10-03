# O-059 - Inventario en glass

## Agent
OpenCode

## Status
DONE

## Priority
Medium

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-005

## Goal
Llevar el módulo al nuevo estilo: Inventario.

## Context
Rediseño visual completo con estética de vidrio hecha solo con CSS (`backdrop-filter` + fondo de degradados estático). Sin dependencias nuevas, sin WebGL, solo tema claro. La variante visual la elige el usuario en la vista previa (Paso 0 del plan). Módulo de listas, tablas y formularios: trabajo repetitivo siguiendo CONVENTIONS v2.

## Scope
- Reemplazar superficies ad-hoc (`border border-border bg-card`, `shadow-xs` sueltos) por `Surface`/utilidades `glass`.
- Tablas y formularios sobre `glass-strong`.
- Revisar estados vacío/carga/error y contraste.

## Out of Scope
- No cambiar lógica, datos, rutas ni textos de negocio.
- No editar `styles.css`, `components/erp/*` ni `components/ui/*`; si falta un token, mover la tarea a `tasks/blocked/` y reportar.

## Expected Files
- src/components/inventory/*
- src/routes/_erp/inventario/*

## Requirements
- Solo clases y composición visual.

## Acceptance Criteria
- [ ] El módulo no conserva superficies ad-hoc.
- [ ] Tests del módulo pasan sin cambios de lógica.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed: `src/components/inventory/stock-movement-form.tsx`, `src/components/inventory/kardex-view.tsx`, `src/routes/_erp/inventario/{movimientos,critico,index}.tsx`
- Features completed: Se quitaron `bg-background` de todos los inputs/selects de los formularios de transferencia, devolución, ajuste y conteo físico, y de los filtros de Kardex. Las listas de conteo y de kardex pasaron de `rounded-lg border border-border` a `glass-subtle` con `divide-border/60`. Se quitaron `bg-card`, `border-input` y `shadow-none` de las barras de búsqueda de las 3 rutas. `inventory-table.tsx` ya usaba primitivos glass.
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores (10 warnings preexistentes); `npm run test` 76 archivos / 353 tests OK.
- Remaining issues: ninguno. Sin cambios de lógica, datos, rutas ni textos.

