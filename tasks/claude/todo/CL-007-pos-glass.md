# CL-007 - POS en glass (4 pantallas)

## Agent
Claude

## Status
TODO

## Priority
High

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-005

## Goal
Llevar al nuevo estilo: Punto de venta, Venta rápida, Listado de cajas y Anticipo clientes.

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
- src/components/pos/*
- src/routes/_erp/pos/*

## Requirements
- Solo clases y composición visual.

## Acceptance Criteria
- [ ] Todas las pantallas del alcance usan el estilo glass sin superficies ad-hoc.
- [ ] Sin regresiones funcionales; tests del módulo pasan.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed:
- Features completed:
- Tests:
- Remaining issues:
