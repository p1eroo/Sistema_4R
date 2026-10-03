# C-041 - Pase final de navegación y breadcrumbs

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 10 — Frontend integration and QA

## Dependencies
C-002, C-003, C-040

## Goal
Todos los ítems del sidebar y breadcrumbs llevan a pantallas reales y el activo es correcto.

## Context
C-002 creó stubs; los módulos ya deberían existir. Este es el cierre de nav.

## Scope
- Revisar app-sidebar nav map.
- Eliminar anclas muertas y stubs residuales.
- Breadcrumbs de todas las rutas de módulo.

## Out of Scope
- No rediseñar menú.
- No nuevas features de negocio.

## Expected Files
- src/components/erp/app-sidebar.tsx
- src/components/erp/nav.ts
- src/components/erp/app-header.tsx (breadcrumbs)

## Requirements
- Incluir Bahías.
- Dashboard activo solo en `/`.
- Ningún href #dashboard-content.

## Acceptance Criteria
- [x] Click en cada ítem del menú abre su módulo.
- [x] Breadcrumb coincide con la ruta.
- [x] No 404 en el mapa C-002.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/erp/nav.ts`: prefijos activos, breadcrumbs de reportes y rutas `$id`.
  - `src/components/erp/nav.test.ts`, `nav-routes.test.ts` (existencia de archivos del contrato).
  - Breadcrumbs alineados en usuarios (roles/sedes).
  - `CONVENTIONS.md` actualizado (nav resuelta).
- Features completed:
  - Reportes hijos y detalles (clientes, OT, usuarios…) resuelven chrome en header.
  - Clientes/Reportes/OT permanecen activos en rutas hijas.
- Tests:
  - 338/338 vitest; nav-routes verifica 0 archivos faltantes.
- Remaining issues:
  - Detalle OT sigue usando override en `WorkOrderDetail` (más específico que `chromeFromPath`).
