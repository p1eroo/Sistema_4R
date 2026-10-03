# O-044 - Tipos de POS, carrito y pagos

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 6 — POS and payments

## Dependencies
O-031, O-033, O-007

## Goal
Modelar ticket POS, líneas, pagos mixtos y estados de venta.

## Context
El footer del sidebar dice «Caja abierta · Turno desde 08:00». POS es módulo propio.

## Scope
- PosTicket, PosLine, PaymentMethod (cash, card, yape, transfer, mixed), PosStatus.
- Schemas.

## Out of Scope
- No service (O-045).
- No UI.
- No caja (O-046).

## Expected Files
- src/domain/pos/types.ts
- src/domain/pos/schemas.ts

## Requirements
- Pagos pueden ser mixtos que sumen el total.
- customerId opcional (venta mostrador).
- Money céntimos.

## Acceptance Criteria
- [x] Schema rechaza pagos que no cubren el total.
- [x] typecheck pasa.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/domain/pos/types.ts` (PosTicket, PosLine, PosPayment, PaymentMethod, PosStatus, `calculatePosTotals`, `sumPayments`).
  - `src/domain/pos/schemas.ts` (líneas, pagos, draft y checkout con validación de cobertura).
  - `src/domain/pos/index.ts` (barrel).
  - `src/domain/pos/types.test.ts` (nuevo).
- Features completed:
  - Ticket POS con `customerId` opcional (venta mostrador), pagos mixtos y estados draft/pending/paid/cancelled/refunded.
  - `posCheckoutSchema` rechaza pagos que no cubren el total (con IGV 18%).
  - `calculatePosTotals` y `sumPayments` puros sobre céntimos.
- Tests:
  - `types.test.ts`: 5 tests (totales, pagos mixtos, cobertura ok/insuficiente, carrito vacío).
  - Suite completa: 254/254 pasan.
- Remaining issues:
  - Service y caja en O-045/O-046.
  - `npm run lint` global verde; archivos de O-044 con 0 issues.
