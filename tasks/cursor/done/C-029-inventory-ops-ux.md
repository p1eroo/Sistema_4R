# C-029 - Transferencias, devoluciones, ajustes y conteo físico

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 5 — Purchases and Inventory

## Dependencies
C-003, O-041

## Goal
Flujos operativos de inventario entre sedes y ajustes con motivo.

## Context
Subítems: Transferencias, Devoluciones, Ajustes, Inventario físico. UX de Cursor.

## Scope
- Rutas correspondientes bajo `/inventario/*`.
- Forms de movimiento con confirmación.
- Conteo físico que genera ajustes.

## Out of Scope
- No reescribir tablas de O-043.
- No compras.

## Expected Files
- src/routes/inventario/transferencias.tsx
- src/routes/inventario/devoluciones.tsx
- src/routes/inventario/ajustes.tsx
- src/routes/inventario/fisico.tsx
- src/components/inventory/stock-movement-form.tsx

## Requirements
- Sedes La Molina / Surco / San Miguel.
- Motivo obligatorio en ajuste.

## Acceptance Criteria
- [x] Transferir entre sedes mueve saldo.
- [x] Conteo físico genera movimiento.
- [x] ErrorState si stock insuficiente.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/inventario/transferencias.tsx`
  - `src/routes/_erp/inventario/devoluciones.tsx`
  - `src/routes/_erp/inventario/ajustes.tsx`
  - `src/routes/_erp/inventario/fisico.tsx`
  - `src/components/inventory/stock-movement-form.tsx`
  - `src/components/inventory/stock-ops.ts`
  - `src/components/inventory/stock-ops.test.ts`
- Features completed:
  - Transferencia Aceite LM→SU: TRF-2026-0001, 24→20 / 5→9.
  - Conteo físico Pastillas 2→3 genera 1 ajuste.
  - ErrorState al transferir 99 pastillas (saldo 2).
  - Devoluciones/ajustes con motivo y confirmación; no hay `return()` en O-041, se usa `adjust`.
- Tests:
  - `stock-ops.test.ts` 4/4.
  - ESLint de archivos C-029 OK.
  - Browser: transfer, error e inventario físico.
- Remaining issues:
  - San Miguel no tiene seed de saldo; el destino crea saldo nuevo.
  - Kardex UI queda para C-030.
