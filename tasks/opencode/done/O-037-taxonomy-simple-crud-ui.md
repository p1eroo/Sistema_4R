# O-037 - CRUD simple de taxonomía

## Agent
OpenCode

## Status
DONE

## Priority
Low

## Phase
PHASE 4 — Products / Services / Suppliers

## Dependencies
O-034, C-003

## Goal
Tablas y forms simples de categorías, marcas y líneas.

## Context
OpenCode posee tablas/forms simples. Cursor se reserva catálogo de productos/servicios y promos.

## Scope
- Rutas `/productos/categorias`, `/productos/marcas`, `/productos/lineas`.
- Table + dialog form.
- Data-states.

## Out of Scope
- No UI de productos (C-024).
- No promociones.
- No rediseñar chrome.

## Expected Files
- src/routes/productos/categorias.tsx
- src/routes/productos/marcas.tsx
- src/routes/productos/lineas.tsx
- src/components/catalog/taxonomy-table.tsx

## Requirements
- Reusar ModulePage.
- No nueva estética.

## Acceptance Criteria
- [x] Se puede crear una marca y verla en la tabla.
- [x] Empty/error funcionan.
- [x] lint/typecheck pasan.

## Verification
- npm run lint
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/components/catalog/taxonomy-table.tsx` (`TaxonomyManager` genérico + `CategoryManager`/`BrandManager`/`LineManager`).
  - `src/routes/_erp/productos/categorias.tsx`, `marcas.tsx`, `lineas.tsx`.
- Features completed:
  - Tablas + dialog de alta + archivado para categorías, marcas y líneas, con `ModulePage`, `SectionCard` y data-states.
  - Líneas con selects de marca/categoría poblados desde los services.
- Tests:
  - UI sin lógica pura nueva; suite completa 294/294 pasan.
- Remaining issues:
  - **Rutas** en `src/routes/_erp/productos/*` (patrón real), no `src/routes/productos/*`.
  - UX de productos/promociones queda para Cursor.
