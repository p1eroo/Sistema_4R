# C-025 - UI catálogo de Servicios

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 4 — Products / Services / Suppliers

## Dependencies
C-003, O-033

## Goal
Lista/detalle de servicios de taller con precio y duración.

## Context
Estimate Builder y POS consumirán este catálogo. El ranking del dashboard usa estos nombres.

## Scope
- Ruta `/productos/servicios`.
- Tabla/cards de servicios.
- Alta/edición de precio y duración.

## Out of Scope
- No promociones (C-026).
- No Estimate Builder.

## Expected Files
- src/routes/productos/servicios.tsx
- src/components/services/service-catalog.tsx

## Requirements
- Nombres idénticos al ranking cuando existan en seed.
- ModulePage + data-states.

## Acceptance Criteria
- [x] Los 4 servicios principales se listan.
- [x] Editar precio persiste en el mock.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/productos/servicios.tsx`
  - `src/components/services/service-catalog.tsx`
  - `src/components/services/service-form.tsx`
  - `src/components/services/service-catalog-ranking.ts`
  - `src/components/services/service-catalog-ranking.test.ts`
- Features completed:
  - Ranking idéntico al dashboard: Mantenimiento preventivo, Cambio de aceite, Sistema de frenos, Diagnóstico computarizado.
  - Tabla con duración, precio y estado. Alta + edición de precio/duración.
  - Editar Cambio de aceite S/ 90.00 → S/ 95.00 persiste en el mock.
- Tests:
  - `service-catalog-ranking.test.ts` 3 tests OK.
  - ESLint de archivos C-025 OK.
  - Browser: 4 nombres del ranking + precio actualizado.
- Remaining issues:
  - El dashboard sigue hardcodeado (C-034). El catálogo no reescribe `index.tsx`.
