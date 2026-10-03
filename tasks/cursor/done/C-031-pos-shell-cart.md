# C-031 - Shell POS y carrito

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 6 — POS and payments

## Dependencies
C-003, O-045, C-024, C-025

## Goal
Pantalla de punto de venta: búsqueda de ítems, carrito y cliente rápido.

## Context
Usuario asignó POS interaction a Cursor. Es UI densa de mostrador.

## Scope
- Ruta `/pos`.
- Layout 2 columnas: catálogo/búsqueda + cart.
- Agregar productos/servicios.
- Seleccionar cliente (Lucía Ramos).

## Out of Scope
- No checkout (C-032).
- No arqueo.
- No rediseñar catálogos fuente.

## Expected Files
- src/routes/pos/index.tsx
- src/components/pos/pos-shell.tsx
- src/components/pos/pos-cart.tsx

## Requirements
- Densidad mostrador, teclado/búsqueda rápida.
- Reusar tokens critical para cobrar luego.
- AppShell permanece.

## Acceptance Criteria
- [x] Se agregan aceite y un servicio al carrito.
- [x] Totales visibles.
- [x] Buscar SKU agrega línea.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/pos/index.tsx`
  - `src/components/pos/pos-shell.tsx`
  - `src/components/pos/pos-cart.tsx`
  - `src/components/pos/pos-catalog.ts`
  - `src/components/pos/pos-catalog.test.ts`
- Features completed:
  - `/pos` con AppShell, catálogo + carrito, cliente Lucía Ramos.
  - SKU exacto `ACE-5W30-01` + Enter/Agregar suma Aceite 5W30.
  - Click en Cambio de aceite suma el servicio.
  - Totales del ticket: Subtotal S/ 170.00, IGV S/ 30.60, Total S/ 200.60.
  - Cobrar deshabilitado (C-032). No se llama `posService.pay`.
- Tests:
  - `pos-catalog.test.ts` 1/1.
  - ESLint de archivos C-031 OK.
  - `tsc` sin errores en `pos/`.
  - Browser: `/pos` con Lucía, aceite por SKU, servicio por click, totales.
- Remaining issues:
  - Checkout y pagos quedan en C-032.
