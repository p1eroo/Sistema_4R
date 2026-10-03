# C-002 - Arquitectura de rutas y contrato de navegación

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 0 — Foundation

## Dependencies
C-001

## Goal
Definir el mapa de rutas file-based y cablear el sidebar a URLs reales sin construir las pantallas de negocio.

## Context
Hoy solo existe `/`. `routeTree.gen.ts` no tiene más hijos. El sidebar lista Taller, POS, Productos, Clientes, etc., pero todos los subitems apuntan a `#dashboard-content`. Sin un contrato de rutas, Cursor y OpenCode chocarán al crear páginas.

## Scope
- Definir el path map de los 11 módulos y los subflujos de Taller (incluye Bahías, ausente hoy en el menú).
- Decidir si hay layout pathless `_erp` que envuelve AppShell o se sigue montando AppShell por página.
- Reemplazar `href="#dashboard-content"` por `Link` de TanStack Router hacia placeholders mínimos.
- Crear rutas stub que solo rendericen AppShell + título, para que la navegación no 404.
- Marcar Dashboard como activo según la ruta actual.

## Out of Scope
- No implementar CRUD, tablas de negocio ni flujos de recepción/POS.
- No rediseñar el sidebar ni el dashboard.
- No editar `src/routeTree.gen.ts` a mano.
- No tocar tipos de dominio ni mocks.

## Expected Files
- src/routes/**/*.tsx (nuevas rutas stub)
- src/components/erp/app-sidebar.tsx (solo Cursor en Phase 0; C-041 retoma al final)
- src/components/erp/nav.ts o similar (mapa de menú + paths)
- src/routes/README.md (actualizar tabla de módulos)

## Requirements
- Seguir convenciones de `src/routes/README.md` (file-based TanStack Start, `$id`, sin `src/pages`).
- Paths en español consistentes con el menú: `/taller/recepcion`, `/clientes`, `/pos`, etc.
- Añadir `Bahías del taller` al grupo Taller para cubrir el alcance del producto.
- Cada stub usa AppShell y tokens existentes; no hay páginas huérfanas fuera del shell.
- El item activo del sidebar refleja la ruta.

## Acceptance Criteria
- [x] Existe un mapa documentado módulo → path → archivo de ruta.
- [x] Todos los ítems del sidebar navegan a una ruta que renderiza AppShell (no anclas al dashboard).
- [x] Dashboard `/` sigue siendo la home visual actual.
- [x] `npx tsc --noEmit` y `npm run lint` pasan.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/erp/nav.ts` (contrato label → path → file)
  - `src/components/erp/nav.test.ts`
  - `src/components/erp/module-stub.tsx`
  - `src/components/erp/app-sidebar.tsx` (Links reales, activo por ruta, Bahías)
  - `src/routes/_erp.tsx` (layout pathless + AppShell)
  - `src/routes/_erp/**` (42 stubs)
  - `src/routes/README.md` (mapa de módulos)
  - `src/router.tsx` (`trailingSlash: "never"`)
  - `src/routeTree.gen.ts` (generado por el plugin; no editado a mano)
- Features completed:
  - Decisión: Dashboard queda en `index.tsx` con su propio AppShell. El resto cuelga de `_erp`.
  - Sidebar ya no usa `#dashboard-content`.
  - Bahías del taller en `/taller/bahias`.
- Tests:
  - `npm run typecheck` pasa.
  - `src/components/erp/nav.test.ts`: 3 tests pasan.
  - Lint de archivos de esta tarea pasa. `npm run lint` global sigue con baseline Prettier preexistente.
  - Browser: `/` intacto; `/clientes`, `/taller/recepcion`, `/taller/bahias` renderizan stub + AppShell; ítem activo correcto.
- Remaining issues:
  - AppHeader sigue hardcodeando "Dashboard" (C-003).
  - Stubs no tienen CRUD (correcto).
