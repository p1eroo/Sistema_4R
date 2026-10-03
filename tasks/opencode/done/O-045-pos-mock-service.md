# O-045 - Mock service de POS

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 6 — POS and payments

## Dependencies
O-044, O-032, O-033, O-041, O-005

## Goal
Abrir ticket, agregar líneas, cobrar y descontar stock mock.

## Context
El dashboard registra «Pago S/ 1,280.00 · Factura F001-00982 · Lucía Ramos».

## Scope
- createTicket, addLine, pay, list, getById.
- Seed incluye F001-00982 S/ 1,280.
- Descuento de stock en pay().
- Tests.

## Out of Scope
- No UI carrito.
- No arqueo de caja (O-046).

## Expected Files
- src/mocks/pos/seed.ts
- src/mocks/pos/service.ts
- src/mocks/pos/service.test.ts

## Requirements
- pay() falla si stock insuficiente.
- Número de documento estable en seed.

## Acceptance Criteria
- [x] Cobrar un ticket de aceite reduce stock.
- [x] Seed F001-00982 existe.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/mocks/pos/seed.ts` (2 tickets; incluye F001-00982 por S/ 1,280.00).
  - `src/mocks/pos/service.ts` (`createPosService`, `posService`).
  - `src/mocks/pos/service.test.ts` (nuevo).
  - `src/domain/pos/types.ts` (añadido `documentNumber` a PosTicket).
  - `src/domain/pos/schemas.ts` (`PosTicketDraftInput`).
- Features completed:
  - `createTicket`, `addLine`, `pay`, `list`, `getById`.
  - `pay` valida cobertura de pagos y stock, y descuenta inventario vía O-041 (movimiento `adjust`).
  - Códigos `TKT-YYYY-NNNN`; IDs de línea/pago deterministas.
- Tests:
  - `service.test.ts`: 5 tests (F001-00982, crear+añadir, cobrar reduce stock, pagos insuficientes, stock insuficiente).
  - Suite completa: 259/259 pasan.
- Remaining issues:
  - Los totales del ticket de referencia se guardan explícitos (108475 + IGV 19525 = 128000) para igualar el dashboard.
  - `npm run lint` global verde; archivos de O-045 con 0 issues.
