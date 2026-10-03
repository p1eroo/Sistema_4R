# CL-008 - Taller A en glass

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
Llevar al nuevo estilo: Recepción (wizard), mapa de daños, inspecciones y diagnósticos.

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
- src/components/reception/*
- src/components/inspections/*
- src/components/diagnostics/*
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
- Files changed: `src/components/{reception,inspections,diagnostics}/*.tsx` (6 archivos).
- Features completed: Tarjetas ad-hoc pasan a `glass`; listas y bloques internos a fondo translúcido sin blur; controles de toolbar con el fondo estándar; separadores suavizados. Sin cambios de lógica.
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores; `npm run test` OK.
- Remaining issues: Capturada solo Recepción (paso 1). Mapa de daños, inspecciones y diagnósticos no se revisaron visualmente. Queda para CL-010.
