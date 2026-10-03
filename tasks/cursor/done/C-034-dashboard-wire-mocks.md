# C-034 - Conectar Dashboard a mocks (sin rediseñar)

## Agent
Cursor

## Status
TODO

## Priority
Critical

## Phase
PHASE 7 — Dashboard

## Dependencies
O-047

## Goal
Sustituir datos hardcodeados del dashboard por O-047 conservando el layout Lovable pixel-a-pixel en lo posible.

## Context
El dashboard YA EXISTE y es la fuente visual. Esta tarea no agrega secciones nuevas.

## Scope
- Refactor de `src/routes/index.tsx` a Query + snapshot.
- Mantener MetricCard, charts, rankings, actividades, compact lists.
- LoadingState de página sin cambiar la estructura final.
- CTA «Nueva orden» hacia recepción.

## Out of Scope
- No rediseñar ni reordenar el dashboard.
- No nuevos KPIs.
- No extraer un dashboard distinto.

## Expected Files
- src/routes/index.tsx (solo Cursor en Phase 7)
- src/components/erp/dashboard-ui.tsx (solo si hace falta tipar props)

## Requirements
- Diff visual mínimo.
- Filtros existentes deben llamar al snapshot (aunque C-035 profundice).

## Acceptance Criteria
- [ ] La página sigue viéndose como el Lovable actual.
- [ ] Los números salen del mock, no de const locales.
- [ ] Nueva orden navega a recepción.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
- Features completed:
- Tests:
- Remaining issues:
