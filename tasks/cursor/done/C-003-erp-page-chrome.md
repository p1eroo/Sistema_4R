# C-003 - Chrome compartido de páginas ERP

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 0 — Foundation

## Dependencies
C-001, C-002, O-006

## Goal
Crear PageHeader y layout de módulo reutilizable sin rediseñar el producto.

## Context
AppHeader tiene breadcrumbs hardcodeados (`Inicio / Dashboard`) y título fijo. No hay PageHeader de módulo. Los módulos necesitan un chrome visual coherente; los estados loading/empty/error los aporta O-006.

## Scope
- Crear `PageHeader` (título, breadcrumb, acciones) alineado al header actual.
- Permitir que AppHeader reciba título/breadcrumb por contexto o props de layout, sin rediseñarlo.
- Definir un wrapper de contenido de módulo (`ModulePage`) que reutilice el padding del dashboard.
- Integrar los data-states de O-006 como slots, no reimplementarlos.

## Out of Scope
- No modificar MetricCard/SectionCard/StatusBadge salvo exports necesarios.
- No construir tablas de negocio.
- No cambiar tokens en `src/styles.css`.
- No editar `src/components/erp/data-states.tsx` (propiedad de OpenCode / O-006).

## Expected Files
- src/components/erp/page-header.tsx
- src/components/erp/module-page.tsx
- src/components/erp/app-header.tsx (solo para breadcrumbs/título dinámicos)
- src/components/erp/CONVENTIONS.md (actualizar uso del chrome)

## Requirements
- Misma densidad y tipografía que el dashboard (Manrope, cards `shadow-xs`, títulos `text-sm font-bold`).
- Breadcrumbs en español: `Inicio / Taller / Recepción`.
- Compatible con rutas stub de C-002.
- No introducir otra librería de layout.

## Acceptance Criteria
- [x] PageHeader y ModulePage existen y se usan en al menos una ruta stub de ejemplo.
- [x] AppHeader deja de hardcodear `Dashboard` cuando la ruta no es `/`.
- [x] Los data-states de O-006 se importan, no se duplican.
- [x] El dashboard `/` no cambia su composición visual.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/erp/page-header.tsx`
  - `src/components/erp/page-chrome.tsx`
  - `src/components/erp/page-chrome-context.ts`
  - `src/components/erp/use-page-chrome.ts`
  - `src/components/erp/module-page.tsx` (slots loading/empty/error vía O-006)
  - `src/components/erp/app-shell.tsx` (PageChromeProvider)
  - `src/components/erp/app-header.tsx` (PageHeader dinámico)
  - `src/components/erp/module-stub.tsx` (usa ModulePage)
  - `src/components/erp/nav.ts` (`chromeFromPath`)
  - `src/components/erp/CONVENTIONS.md`
- Features completed:
  - Header en `/clientes` muestra `Inicio / Clientes`.
  - Dashboard `/` sigue mostrando `Inicio / Dashboard` y el mismo layout.
  - Data-states importados, no copiados.
- Tests:
  - `npm run typecheck` pasa.
  - `nav.test.ts` 5 tests pasan (incluye chromeFromPath).
  - Lint de archivos de la tarea pasa.
- Remaining issues:
  - `data-states.tsx` no se tocó (ownership OpenCode).
  - Lint global sigue con baseline Prettier legado.
