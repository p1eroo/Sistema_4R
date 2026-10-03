# O-034 - Taxonomía: categorías, marcas y líneas

## Agent
OpenCode

## Status
DONE

## Priority
Medium

## Phase
PHASE 4 — Products / Services / Suppliers

## Dependencies
O-002, O-005

## Goal
CRUD mock de categorías, marcas y líneas para filtrar el catálogo.

## Context
El menú Lovable ya lista Categorías, Marcas, Líneas.

## Scope
- Types + schemas + seeds (NGK, Toyota, frenos, filtros, aceites).
- Services simples.
- Tests mínimos.

## Out of Scope
- No UI compleja (O-037 hará tablas simples).
- No promociones.

## Expected Files
- src/domain/catalog/types.ts
- src/mocks/catalog/*.ts

## Requirements
- Product.brandId/categoryId opcionales pero tipados.
- IDs estables NGK etc.

## Acceptance Criteria
- [x] Hay marcas y categorías seed.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/domain/catalog/types.ts` (CatalogCategory, CatalogBrand, CatalogLine, CatalogStatus).
  - `src/domain/catalog/schemas.ts` (create/update por entidad).
  - `src/domain/catalog/index.ts` (barrel).
  - `src/mocks/catalog/seed.ts` (5 categorías, 6 marcas incl. NGK/Toyota, 5 líneas).
  - `src/mocks/catalog/service.ts` (`categoryService`, `brandService`, `lineService` con factory genérica).
  - `src/mocks/catalog/service.test.ts` (nuevo).
- Features completed:
  - CRUD + archive para categorías, marcas y líneas; código único normalizado.
  - `CatalogLine` enlaza `brandId`/`categoryId` (compatibles con `Product.brandId`/`categoryId`).
- Tests:
  - `service.test.ts`: 5 tests.
  - Suite completa: 211/211 pasan.
- Remaining issues:
  - Tablas simples UI en O-037.
  - `npm run lint` global verde; archivos de O-034 con 0 issues.
