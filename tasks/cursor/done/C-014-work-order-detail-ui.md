# C-014 - UI detalle de Orden de trabajo

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
C-013, O-024

## Goal
Ficha compleja de OT: cabecera, cliente/vehículo, estado, pestañas de operación.

## Context
Usuario asignó Work Order detail a Cursor. Es el hub de diagnóstico, presupuesto, QC y entrega.

## Scope
- Ruta `/taller/ordenes/$id`.
- Header con código, placa chip, estado, asesor.
- Tabs placeholder: Resumen, Diagnóstico, Presupuesto, WIP, QC, Entrega.
- Cambio de estado respetando transiciones O-023 (vía service).

## Out of Scope
- No construir Estimate Builder (C-015).
- No Kanban board.
- No implementar QC completo (C-021).

## Expected Files
- src/routes/taller/ordenes/$id.tsx
- src/components/work-orders/work-order-detail.tsx

## Requirements
- UX densa tipo ERP, no landing.
- Tabs con primitivos existentes.
- Links a cliente y vehículo.

## Acceptance Criteria
- [x] OT-2026-0184 muestra Toyota Corolla ABC-123 y estado Control.
- [x] Transición ilegal muestra error.
- [x] Layout coherente con el dashboard.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/work-orders/work-order-detail.tsx`
  - `src/routes/_erp/taller/ordenes/$id.tsx`
- Features completed:
  - Cabecera OT-2026-0184, chip ABC-123, estado Control, asesor Carlos Mendoza.
  - Links a Lucía Ramos y Toyota Corolla 2021 · ABC-123.
  - Tabs Resumen / Diagnóstico / Presupuesto / WIP / QC / Entrega.
  - Cambio de estado vía `workOrderService.updateStatus`; Control → Diagnóstico muestra “No se puede pasar de Control a Diagnóstico.”
- Tests:
  - Lint y typecheck OK.
  - Browser: ficha OT-2026-0184 y error de transición ilegal.
- Remaining issues:
  - Estimate Builder en C-015. Kanban en C-016. QC/entrega en C-021/C-022.
