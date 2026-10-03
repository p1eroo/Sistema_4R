# O-005 - Kit de repositorio mock en memoria

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 0 — Foundation

## Dependencies
O-002, O-003

## Goal
Crear un repositorio in-memory genérico (CRUD, delay, errores simulados) para todos los mocks.

## Context
El prototipo es frontend-only. Todos los módulos usarán servicios mock. Sin un kit común, cada agente inventará un store distinto.

## Scope
- createInMemoryRepository<T> con getAll, getById, create, update, remove, query.
- Delay configurable y fallo inyectable para estados de error.
- IDs generados de forma estable y determinista en seeds.
- Tests del repositorio genérico.

## Out of Scope
- No persistencia en localStorage todavía (se puede dejar hook, no implementar por módulo).
- No seeds de clientes/OT.
- No React Query hooks.

## Expected Files
- src/mocks/shared/in-memory-repository.ts
- src/mocks/shared/in-memory-repository.test.ts
- src/mocks/shared/delay.ts

## Requirements
- Inmutabilidad hacia afuera (devolver copias).
- Compatible con ListQuery de O-003.
- Sin dependencias de UI.

## Acceptance Criteria
- [x] CRUD + query funcionan con un entity de prueba.
- [x] Se puede forzar error y delay en tests.
- [x] typecheck, lint y tests pasan (archivos propios).

## Verification
- bun run typecheck
- bun run lint (archivos propios)
- bun run test

## Completion Report
- Files changed:
  - `src/mocks/shared/delay.ts` (helper `delay(ms)`).
  - `src/mocks/shared/in-memory-repository.ts` (`BaseEntity`, `RepositoryQuery`, `InMemoryRepository`, `createInMemoryRepository`, `RepositoryError`).
  - `src/mocks/shared/in-memory-repository.test.ts` (nuevo).
- Features completed:
  - Repositorio genérico con getAll, getById, create, update, remove y query.
  - `query` compone search + sort + paginate de O-003 y devuelve `ListResult<T>`.
  - IDs deterministas (`id-0004`, prefijo configurable / `generateId` inyectable).
  - `setDelay(ms)` y `failNext(error)` para simular latencia y fallos.
  - Inmutabilidad hacia afuera: getAll/getById/query devuelven copias (`structuredClone`).
- Tests:
  - `src/mocks/shared/in-memory-repository.test.ts`: 9 tests (listado, create/ids, copias, update, remove/errores, query, failure injection, delay).
  - Suite completa: 25/25 pasan. `bun run typecheck` exit 0.
- Remaining issues:
  - Sin persistencia (localStorage) por diseño; queda como hook futuro.
  - `bun run lint` global sigue con el baseline prettier preexistente; los archivos de O-005 tienen 0 issues.
