# C-028 - Workflow de nueva compra y OC

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 5 — Purchases and Inventory

## Dependencies
C-027, O-039

## Goal
Flujo de alta de compra/OC: proveedor, líneas, recepción de mercadería.

## Context
UX de documento comercial. OpenCode ya listó compras; Cursor construye el documento.

## Scope
- Rutas `/compras/nueva` y `/compras/ordenes`.
- Editor de líneas, totales, recibir.
- Al recibir, disparar O-041 si el hook existe.

## Out of Scope
- No rediseñar listas O-042.
- No kardex UI.

## Expected Files
- src/routes/compras/nueva.tsx
- src/routes/compras/ordenes.tsx
- src/components/purchases/purchase-editor.tsx

## Requirements
- Seleccionar proveedor de C-027/O-036.
- Productos de O-032.

## Acceptance Criteria
- [x] Se emite una OC y se recibe.
- [x] El stock mock aumenta si O-041 está conectado.
- [x] Validación de líneas vacías.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/compras/nueva.tsx`
  - `src/routes/_erp/compras/ordenes.tsx`
  - `src/components/purchases/purchase-editor.tsx`
  - `src/components/purchases/purchase-draft.ts`
  - `src/components/purchases/purchase-draft.test.ts`
- Features completed:
  - Editor con proveedor C-027, líneas O-032 y totales `calculatePurchaseTotals`.
  - Emitir OC + registrar compra; Recibir llama `receivePurchase` (O-041).
  - Lista `/compras/ordenes` con seeds y OC-2026-0003.
  - Stock PRD-0002 La Molina 2 → 7; vacío: «Agrega al menos una línea.»
- Tests:
  - `purchase-draft.test.ts` 2/2 (vacío + 5×S/ 82.00 = S/ 483.80).
  - ESLint de archivos C-028 OK.
  - Browser: emitir, recibir e inventario.
- Remaining issues:
  - `tsc` global sigue con avisos previos en `delivery-form.tsx` (C-022), no de esta tarea.
  - Kardex UI queda para C-030.
