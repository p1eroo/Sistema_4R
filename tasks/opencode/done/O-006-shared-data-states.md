# O-006 - Componentes de loading, empty y error

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 0 — Foundation

## Dependencies
None

## Goal
Estados de datos reutilizables con primitivos UI existentes.

## Context
Hay `skeleton.tsx`, `alert.tsx` y `empty` no existe. OpenCode posee loading/empty/error. Cursor no debe reimplementarlos en cada módulo.

## Scope
- LoadingState (skeleton de tabla y de página).
- EmptyState (ícono, título, descripción, CTA opcional).
- ErrorState (mensaje, reintento).
- Usar Button, Alert, Skeleton existentes. Sin nueva estética.

## Out of Scope
- No PageHeader ni layout (Cursor / C-003).
- No tocar dashboard.
- No inventar colores nuevos.

## Expected Files
- src/components/erp/data-states.tsx (solo OpenCode)
- src/components/erp/data-states.test.ts (opcional, smoke de props)

## Requirements
- API simple: `LoadingState variant="table" | "page"`, `EmptyState`, `ErrorState`.
- Textos por defecto en español, sobreescribibles.
- No importar rutas ni mocks.

## Acceptance Criteria
- [x] Los tres estados renderizan con primitivos actuales.
- [x] C-003 puede importarlos sin modificar este archivo.
- [x] lint y typecheck pasan (archivos propios).

## Verification
- bun run lint (archivos propios)
- bun run typecheck
- bun run test

## Completion Report
- Files changed:
  - `src/components/erp/data-states.tsx` (LoadingState, EmptyState, ErrorState + props).
  - `src/components/erp/data-states.test.tsx` (nuevo; smoke SSR).
- Features completed:
  - `LoadingState variant="table" | "page"` con Skeleton existente y etiqueta accesible "Cargando…".
  - `EmptyState` con ícono (default Inbox), título/descripción en español y CTA opcional (`action`).
  - `ErrorState` sobre `Alert destructive`, con `onRetry` → Button "Reintentar".
  - Sin colores nuevos: solo tokens existentes (`bg-primary/10`, `text-muted-foreground`, etc.).
- Tests:
  - `src/components/erp/data-states.test.tsx`: 6 tests con `renderToStaticMarkup` (sin jsdom ni nuevas deps).
  - Suite completa: 42/42 pasan. `bun run typecheck` exit 0.
- Remaining issues:
  - `bun run lint` global sigue con el baseline prettier preexistente; los archivos de O-006 tienen 0 issues.
