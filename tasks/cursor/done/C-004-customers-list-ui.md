# C-004 - UI listado de Clientes

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
C-002, C-003, O-010, O-015

## Goal
Página de clientes con búsqueda, filtros y tabla coherente con el dashboard.

## Context
El menú tiene Clientes pero no hay UI. Es el primer módulo CRUD visual del ERP.

## Scope
- Ruta `/clientes` con ModulePage + tabla.
- Búsqueda por nombre/documento, filtro sede/estado.
- CTA nuevo cliente abre form O-015 (dialog o ruta hija simple).
- Loading/empty/error con O-006.
- Click de fila hacia detalle (C-005 puede completar la ruta).

## Out of Scope
- No rediseñar AppShell.
- No implementar historial vehicular.
- No editar customer-form.tsx salvo props públicas.

## Expected Files
- src/routes/clientes/index.tsx
- src/components/customers/customer-list.tsx
- src/components/erp/app-sidebar.tsx (solo active state si hace falta)

## Requirements
- TanStack Query contra O-010.
- Tabla con `@/components/ui/table`.
- Densidad igual al dashboard.

## Acceptance Criteria
- [x] Se listan los seeds.
- [x] Crear cliente recarga la tabla.
- [x] Empty/error visibles.
- [x] Navegación desde sidebar funciona.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/customers/customer-list.tsx`
  - `src/components/customers/customer-list-filters.ts`
  - `src/components/customers/customer-list-filters.test.ts`
  - `src/routes/_erp/clientes/index.tsx` (ruta real; no `src/routes/clientes/`)
  - `src/routes/_erp/clientes/$id.tsx` (placeholder de navegación; C-005 lo completa)
- Features completed:
  - Tabla de seeds con búsqueda, filtro sede/estado y CTA Nuevo cliente (dialog O-015).
  - TanStack Query contra `customerService`. Crear recarga la lista.
  - Loading/empty/error con O-006. Click de fila a `/clientes/$id`.
- Tests:
  - `npm run typecheck` OK.
  - Lint de archivos de la tarea OK.
  - Tests de filtros: 3/3.
  - Browser: 12 seeds, búsqueda Lucía, alta Pedro Test recarga la tabla, sidebar Clientes activo.
- Remaining issues:
  - Detalle real en C-005.
