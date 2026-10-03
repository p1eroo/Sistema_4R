# O-057 - Productos, servicios, catálogo y precios en glass

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
Llevar el módulo al nuevo estilo: Productos, servicios, catálogo y precios.

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
- src/components/products/*
- src/components/services/*
- src/components/catalog/*
- src/components/pricing/*
- src/routes/_erp/productos/*

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
- Files changed: `src/components/products/product-catalog.tsx`, `src/components/products/product-form.tsx`, `src/components/services/service-catalog.tsx`, `src/components/services/service-form.tsx`, `src/components/pricing/promo-editor.tsx`, `src/components/pricing/promo-list.tsx`
- Features completed: Se quitaron superficies ad-hoc (`bg-card`, `border-input`, `shadow-none`) de barras de filtros y formularios de Productos/Servicios/Promociones. División de listas de ranking/stock crítico a `divide-border/60`. El form de promociones reemplazó su panel ad-hoc `rounded-lg border border-border bg-muted/40` por `glass-subtle`. `taxonomy-table.tsx` y las rutas ya usaban primitivos glass.
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores (10 warnings preexistentes); `npm run test` 76 archivos / 353 tests OK.
- Remaining issues: ninguno. Sin cambios de lógica, datos, rutas ni textos.

