# C-032 - Checkout y pagos POS

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 6 — POS and payments

## Dependencies
C-031, O-045

## Goal
Cobro con métodos mixtos, vuelto y ticket confirmado.

## Context
Cierra la venta y alimenta actividad del dashboard.

## Scope
- Panel de pago (efectivo, tarjeta, Yape, transferencia).
- Vuelto.
- Confirmación con nro de documento.
- Descuento stock vía O-045.

## Out of Scope
- No SUNAT real.
- No caja cierre.

## Expected Files
- src/components/pos/pos-checkout.tsx
- src/components/pos/pos-receipt.tsx

## Requirements
- Pagos mixtos deben cubrir el total.
- CTA crítico usa `bg-critical` del dashboard.

## Acceptance Criteria
- [x] Se cobra un ticket y queda en listado.
- [x] Pago incompleto no confirma.
- [x] Stock se reduce.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/pos/pos-checkout.tsx`
  - `src/components/pos/pos-receipt.tsx`
  - `src/components/pos/pos-payment-plan.ts`
  - `src/components/pos/pos-payment-plan.test.ts`
  - `src/components/pos/pos-cart.tsx`
  - `src/components/pos/pos-shell.tsx`
  - `src/mocks/pos/service.ts` (asigna `documentNumber` en `pay`)
  - `src/mocks/pos/service.test.ts`
- Features completed:
  - Dialog de cobro con efectivo/tarjeta/Yape/transferencia y pagos mixtos.
  - Faltante/vuelto; confirmar deshabilitado si no cubre total.
  - Recibo con comprobante (p. ej. F001-00983) y vuelto.
  - Ventas recientes en `/pos`; stock descontado vía `pay()`.
- Tests:
  - `pos-payment-plan.test.ts` 3/3; `service.test.ts` incluye F001-00983.
  - Browser: cobro TKT-2026-0003 S/ 200.60, pago parcial bloqueado.
- Remaining issues:
  - Sesión de caja en C-033.
