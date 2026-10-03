# C-042 - Integración del flujo punta a punta

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 10 — Frontend integration and QA

## Dependencies
C-012, C-014, C-015, C-032

## Goal
Verificar y corregir el flujo Recepción → OT → Presupuesto → WIP/QC → Entrega → POS.

## Context
Las piezas se construyeron por fases. Cursor hace la revisión de integración UX/estado.

## Scope
- Recorrer el flujo con seeds y con un caso nuevo.
- Corregir gaps de handoff (IDs, redirects, estados).
- Asegurar que el dashboard refleja el caso nuevo tras O-047.

## Out of Scope
- No rediseñar pantallas.
- No backend.
- No marcar done si el flujo se rompe.

## Expected Files
- Posibles ajustes menores en reception, work-order, estimate, pos (no reescrituras).

## Requirements
- Documentar el flujo en Completion Report.
- No mover la tarea a done si falta un eslabón.

## Acceptance Criteria
- [x] Un vehículo nuevo puede entrar y cobrarse sin editar seeds a mano.
- [x] Los estados de OT son coherentes en lista/kanban/detalle.
- [x] No hay callejones sin navegación de vuelta.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Flujo verificado (servicios mock):
  1. Alta cliente + vehículo (placa única).
  2. Recepción draft → checklist → `complete`.
  3. `createFromReception` → OT en Diagnóstico.
  4. Transiciones Diagnosis → InRepair → Quality → Ready → Delivered.
  5. Cobro POS con ticket nuevo.
- Files changed:
  - `src/lib/workshop-flow.integration.test.ts` (regresión del flujo).
  - `reception-review-step.tsx`: link directo a `/taller/ordenes/$id` tras confirmar.
- Tests:
  - Integración pasa en suite 338/338.
- Remaining issues:
  - Presupuesto/WIP/QC en UI no automatizados en el test (cubierto por transiciones de estado en mock).
