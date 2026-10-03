# O-056 - Clientes y Proveedores en glass

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
Llevar el módulo al nuevo estilo: Clientes y Proveedores.

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
- src/components/customers/*
- src/components/suppliers/*
- src/routes/_erp/clientes/*
- src/routes/_erp/proveedores/*

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
- Files changed: `src/components/customers/customer-list.tsx`, `src/components/suppliers/supplier-list.tsx`, `src/components/suppliers/supplier-form.tsx`
- Features completed: Se eliminaron superficies ad-hoc (`bg-card`, `bg-background`, `shadow-none`, `border-input` redundantes) de los selects de toolbar de Clientes y de la búsqueda/formulario de Proveedores. Listados, tablas y diálogos ya heredan `SectionCard` (glass), `Table` (glass-strong) y `Dialog` (blanco opaco); no quedan superficies ad-hoc en el módulo.
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores (10 warnings preexistentes); `npm run test` 76 archivos / 353 tests OK.
- Remaining issues: ninguno. Sin cambios de lógica, datos, rutas ni textos.

