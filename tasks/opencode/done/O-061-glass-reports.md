# O-061 - Reportes en glass

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
Llevar el módulo al nuevo estilo: Reportes.

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
- src/components/reports/*
- src/routes/_erp/reportes/*

## Requirements
- Solo clases y composición visual.
- Colores de gráficos solo con tokens `chart-*`.

## Acceptance Criteria
- [ ] El módulo no conserva superficies ad-hoc.
- [ ] Tests del módulo pasan sin cambios de lógica.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed: `src/components/reports/report-view.tsx`
- Features completed: El módulo ya heredaba glass vía `ModulePage`, `SectionCard`, `MetricCard`, `Table` y `ChartContainer` (sin superficies ad-hoc). Se alineó el color de la serie del gráfico al token `chart-1` (config y `Bar fill`) cumpliendo el requisito de usar solo tokens `chart-*`; grid `3 3`, ejes sin líneas e `isAnimationActive={false}` ya estaban correctos. Estados loading/error/empty se resuelven con `ModulePage status`.
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores (10 warnings preexistentes); `npm run test` 76 archivos / 353 tests OK.
- Remaining issues: ninguno. Sin cambios de lógica, datos, rutas ni textos.

