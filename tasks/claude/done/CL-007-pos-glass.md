# CL-007 - POS en glass (4 pantallas)

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
- [x] Todas las pantallas del alcance usan el estilo glass sin superficies ad-hoc.
- [x] Sin regresiones funcionales; tests del módulo pasan.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed: `src/components/pos/*.tsx` (11 archivos). Las rutas de `routes/_erp/pos` no necesitaron cambios.
- Features completed: paneles, tablas y toolbars pasan a `glass` / `glass-strong`; tarjetas de producto y riel de categorías quedan translúcidos sin blur (elementos repetidos); el autocompletado de Venta rápida usa `glass-float`; separadores y cabeceras de tabla suavizados. El buscador del Punto de venta ya no queda angosto: la cabecera apila buscador y marca hasta `2xl`. Etiqueta "Transferencia" ya no desborda en Venta rápida.
- Tests: `npm run typecheck` OK; lint de `components/pos` sin problemas; `npm run test` 353 OK. Capturas de las 4 pantallas; en Punto de venta se agregó un producto al ticket con clic real.
- Remaining issues: no se capturaron los diálogos de cobro/recibo ni los paneles laterales de cajas y anticipos con el estilo nuevo.
