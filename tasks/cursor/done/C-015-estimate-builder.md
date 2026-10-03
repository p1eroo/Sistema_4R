# C-015 - Estimate Builder

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
C-014, O-027

## Goal
Constructor de presupuesto: agregar líneas, cantidades, descuentos y totales en vivo.

## Context
Flujo clave del taller. Phase 4 podrá enganchar catálogo; ahora líneas genéricas + búsqueda libre.

## Scope
- UI de líneas add/edit/remove.
- Totales (subtotal, IGV, total) usando helper O-027.
- Estados pending/approved/rejected.
- Montar en tab Presupuesto de la OT y ruta `/taller/presupuestos` lista.

## Out of Scope
- No catálogo productos (C-024).
- No cobro POS.
- No rediseñar detalle OT.

## Expected Files
- src/components/estimates/estimate-builder.tsx
- src/routes/taller/presupuestos/index.tsx

## Requirements
- No recalcular dinero en el componente: usar totals.ts.
- Formato S/.

## Acceptance Criteria
- [x] Se arma un presupuesto y el total coincide con el helper.
- [x] Lista muestra 6 presupuestos (el seed O-027 tiene 3 pendientes).
- [x] Aprobar cambia status en el mock.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/estimates/estimate-builder.tsx`
  - `src/components/estimates/estimate-list.tsx`
  - `src/components/estimates/estimate-money.ts`
  - `src/components/estimates/estimate-money.test.ts`
  - `src/routes/_erp/taller/presupuestos/index.tsx`
  - `src/components/work-orders/work-order-detail.tsx` (tab Presupuesto)
- Features completed:
  - Constructor con líneas libres, totales en vivo vía `calculateEstimateTotals` y formato `S/`.
  - Lista de 6 presupuestos; Aprobar pasa pending → approved.
  - Tab Presupuesto de la OT muestra EST existente o el constructor.
- Tests:
  - `estimate-money.test.ts` 1/1. Lint y typecheck OK.
  - Browser: 6 registros / 3 pendientes; aprobar deja 2 pendientes; OT-2026-0182 muestra S/ 100.00 + S/ 18.00 = S/ 118.00.
- Remaining issues:
  - El seed mock solo tiene 3 `pending_approval`, no 6. Kanban en C-016.
