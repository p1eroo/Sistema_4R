# C-040 - Wiring de header: sede, búsqueda, notificaciones y perfil

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 9 — Users / Branches / Settings

## Dependencies
C-002, O-049, O-050

## Goal
Dejar de hardcodear sede, usuario y notificaciones en AppHeader.

## Context
AppHeader tiene búsqueda local que no busca, sede fija y 2 notificaciones estáticas.

## Scope
- Sede desde O-050 (contexto de sucursal).
- Usuario desde seed identidad.
- Notificaciones mock (stock crítico + OT QC) clickeables.
- Búsqueda global mínima (placa/OT/cliente) hacia rutas existentes.

## Out of Scope
- No rediseñar el header.
- No login page completa salvo link placeholder.
- No tocar menú del sidebar.

## Expected Files
- src/components/erp/app-header.tsx
- src/mocks/notifications/service.ts (si hace falta, coordinar: preferir leer O-041/O-024)
- src/lib/global-search.ts

## Requirements
- Mantener markup visual.
- Perfil/Preferencias pueden ir a settings o placeholder.

## Acceptance Criteria
- [x] Cambiar a Surco actualiza el label del header.
- [x] La campana abre items reales del mock.
- [x] Buscar ABC-123 navega al vehículo.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/erp/app-header.tsx`, `branch-context.tsx`, `app-shell.tsx`.
  - `src/mocks/notifications/service.ts`, `src/lib/global-search.ts`, `global-search.test.ts`.
- Features completed:
  - Contexto de sede (sessionStorage) con listado O-050.
  - Usuario USR-0001, notificaciones mock con links, búsqueda Enter → vehículo/OT/cliente.
  - Perfil → `/usuarios/USR-0001`, Preferencias → `/configuracion`.
- Tests:
  - `global-search.test.ts` (ABC-123, OT-2026-0184); 332/332 suite.
- Remaining issues:
  - Cerrar sesión sigue placeholder; typecheck global con deuda previa.
