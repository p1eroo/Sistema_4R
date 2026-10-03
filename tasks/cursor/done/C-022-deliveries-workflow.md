# C-022 - Flujo de Entregas

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
C-021, O-029

## Goal
Entregar vehículo listo: checklist de salida, firma mock, hora.

## Context
Dashboard «Vehículos listos pronto» es esta cola.

## Scope
- Ruta `/taller/entregas`.
- Cola de hoy + formulario de entrega.
- Marcar delivered en OT.

## Out of Scope
- No facturación electrónica.
- No POS (puede CTA).

## Expected Files
- src/routes/taller/entregas/index.tsx
- src/components/workshop/delivery-form.tsx

## Requirements
- Mostrar ABC-123 11:30 Control final, etc.
- No inventar otras placas para esa card.

## Acceptance Criteria
- [x] Las 3 entregas del dashboard aparecen.
- [x] Completar entrega cambia OT a delivered.
- [x] EmptyState al vaciar la cola.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/taller/entregas/index.tsx`
  - `src/components/workshop/delivery-form.tsx`
  - `src/components/workshop/delivery-status.ts`
  - `src/components/work-orders/work-order-detail.tsx` (tab Entrega)
- Features completed:
  - Cola de hoy con ABC-123 11:30 Control final, F6T-884 14:00 Lavado, B4X-521 16:30 Prueba de ruta.
  - Checklist, firma mock y `markDelivered` (OT → Entregado).
  - EmptyState cuando no quedan pendientes. CTA a POS.
- Tests:
  - ESLint de archivos C-022 OK.
  - Browser: 3 cards del dashboard. Tras QC de 0184, entregar ABC-123 deja la OT Entregado y sale de la cola.
- Remaining issues:
  - F6T-884 y B4X-521 tienen OT en Diagnóstico; `markDelivered` exige Listo. EmptyState total pide pasar esas OT antes.
  - Typecheck global: `BranchStatus` de OpenCode, fuera de alcance.
