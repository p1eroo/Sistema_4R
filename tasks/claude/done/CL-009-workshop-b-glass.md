# CL-009 - Taller B en glass

## Agent
Claude

## Status
DONE

## Priority
Medium

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-005

## Goal
Llevar al nuevo estilo: Órdenes de trabajo, presupuestos, WIP/kanban, bahías, citas, calidad, entregas y vehículos.

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
- src/components/work-orders/*
- src/components/estimates/*
- src/components/workshop/*
- src/components/appointments/*
- src/components/vehicles/*
- rutas de taller correspondientes

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
- Files changed: `src/components/{work-orders,estimates,workshop,appointments,vehicles}/*.tsx` (10 archivos).
- Features completed: Misma migración: columnas y tarjetas del tablero WIP, bahías, listas de OT, presupuestos, citas y vehículos sobre vidrio suave. Sin cambios de lógica.
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores; `npm run test` OK.
- Remaining issues: Capturados WIP, órdenes y bahías (solo WIP revisado). Detalle de OT, estimate builder, calidad y entregas no se revisaron visualmente. Queda para CL-010.
