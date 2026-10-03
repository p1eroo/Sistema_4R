# O-003 - Tipos de lista, filtro y paginación

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 0 — Foundation

## Dependencies
O-002

## Goal
Unificar contratos de query para tablas (search, sort, page, filters).

## Context
Todas las listas del ERP (clientes, OT, stock, compras) necesitan el mismo contrato para que OpenCode no invente un helper distinto por módulo.

## Scope
- Tipos ListQuery, ListResult<T>, SortDir, DateRangeFilter.
- Helpers `paginate`, `sortBy`, `includesQuery` sobre arrays en memoria.
- Tests unitarios de paginación y sort.

## Out of Scope
- No crear componentes de tabla.
- No implementar filtros de un módulo concreto.
- No usar React Query aquí.

## Expected Files
- src/domain/shared/list-query.ts
- src/lib/list-query.ts
- src/lib/list-query.test.ts

## Requirements
- Paginación 1-indexed con `page`, `pageSize`, `total`, `totalPages`.
- Search case-insensitive sobre campos declarados.
- Funciones puras, sin I/O.

## Acceptance Criteria
- [x] Helpers cubren vacío, última página incompleta y sort estable.
- [x] Tests unitarios pasan.
- [x] typecheck y lint pasan (archivos propios).

## Verification
- bun run typecheck
- bun run lint (archivos propios)
- bun run test

## Completion Report
- Files changed:
  - `src/domain/shared/list-query.ts` (ListQuery, ListResult<T>, SortDir, DateRangeFilter, defaults).
  - `src/lib/list-query.ts` (`paginate`, `sortBy`, `includesQuery`, `normalizePage/PageSize`).
  - `src/lib/list-query.test.ts` (nuevo).
- Features completed:
  - Contrato único de listas: search, page/pageSize 1-indexed, sortBy/sortDir, filters.
  - Paginación tiene `page`, `pageSize`, `total`, `totalPages` vía `createPagination` de O-002.
  - Búsqueda case-insensitive sobre campos declarados; sort estable con tiebreak por índice.
- Tests:
  - `src/lib/list-query.test.ts`: 9 tests (paginación, última página, vacío/fuera de rango, normalización, sort asc/desc/estable/nullish, search).
  - Suite completa: 16/16 pasan. `bun run typecheck` exit 0.
- Remaining issues:
  - `bun run lint` global sigue con el baseline prettier preexistente; los archivos de O-003 tienen 0 issues.
