# O-058 - Compras en glass

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
Llevar el módulo al nuevo estilo: Compras.

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
- src/components/purchases/*
- src/routes/_erp/compras/*

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
- Files changed: `src/components/purchases/purchase-editor.tsx`, `src/routes/_erp/compras/{index,ordenes,cotizaciones,gastos}.tsx`
- Features completed: Se quitaron `bg-card`, `border-input`, `shadow-none` de las barras de filtros de las 4 vistas de Compras y `bg-background` de inputs/selects del editor de compra. Las superficies ya provienen de `SectionCard`/`PurchaseTable` (glass) y el modal usa el `Dialog` primitivo.
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores (10 warnings preexistentes); `npm run test` 76 archivos / 353 tests OK.
- Remaining issues: ninguno. Sin cambios de lógica, datos, rutas ni textos.

