# O-059 - Inventario en glass

## Agent
OpenCode

## Status
TODO

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
- Files changed:
- Features completed:
- Tests:
- Remaining issues:
