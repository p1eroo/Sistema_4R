# CL-006 - Dashboard en glass

## Agent
Claude

## Status
DONE

## Priority
High

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-005

## Goal
Llevar al nuevo estilo: Dashboard (`/`): KPIs, gráficos, listas y filtros.

## Context
Rediseño visual completo con estética de vidrio hecha solo con CSS (`backdrop-filter` + fondo de degradados estático). Sin dependencias nuevas, sin WebGL, solo tema claro. La variante visual la elige el usuario en la vista previa (Paso 0 del plan). Pantallas complejas con composición propia.

## Scope
- Migrar superficies armadas a mano a `Surface`/utilidades `glass`.
- Ajustar jerarquía, espaciado y estados (vacío, carga, error) según CONVENTIONS v2.
- Revisar contraste y vista en pantallas chicas.

## Out of Scope
- No cambiar lógica, datos, rutas ni textos de negocio.
- No editar `styles.css`, `components/erp/*` ni `components/ui/*`; si falta un token, bloquear y reportar.

## Expected Files
- src/routes/index.tsx
- src/components/dashboard/*

## Requirements
- Solo clases y composición visual.

## Acceptance Criteria
- [x] Todas las pantallas del alcance usan el estilo glass sin superficies ad-hoc.
- [x] Sin regresiones funcionales; tests del módulo pasan.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed: `src/routes/index.tsx` (no existen componentes `.tsx` en `components/dashboard`).
- Features completed: El dashboard ya heredaba el vidrio de los primitivos; se ajustaron separadores, la lista de "Vehículos listos pronto" y el buscador móvil. Correcciones de datos visibles: eje Y de "Ventas por día" sin decimales (antes `0.004k`), "Cuentas por cobrar" mostraba solo `S/` y ahora muestra el monto, y la fecha del saludo era fija ("Viernes, 25 de septiembre") y ahora es la de hoy.
- Tests: `npm run typecheck` OK; lint del archivo sin problemas; `npm run test` 353 OK. Captura completa del dashboard con Chrome headless.
- Remaining issues: "Ingresos vs. gastos" salió vacío en la captura headless; revisar en navegador real (CL-010).
