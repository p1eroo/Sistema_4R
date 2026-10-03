# C-012 - Revisión final de Recepción y handoff a OT

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 2 — Vehicle Reception

## Dependencies
C-009, C-010, C-011, O-019, O-024

## Goal
Resumen de recepción, confirmación y creación de orden de trabajo mock.

## Context
Cierra Phase 2 y abre Phase 3. complete() de recepción + create de OT deben quedar ligados.

## Scope
- Pantalla de revisión con cliente, vehículo, daños, checklist.
- Confirmar → complete reception + crear OT (O-024).
- Redirect a detalle de OT o estado de éxito.

## Out of Scope
- No Estimate Builder.
- No cobro POS.
- No rediseñar pasos previos.

## Expected Files
- src/components/reception/reception-review-step.tsx

## Requirements
- No crear OT a mano en el componente: llamar services.
- Idempotencia básica (no duplicar OT al reclick).

## Acceptance Criteria
- [x] Confirmar una recepción completa genera una OT visible en el mock.
- [x] Draft incompleto no se puede confirmar.
- [x] Flujo usable de punta a punta en el wizard.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/reception/reception-review-handoff.ts`
  - `src/components/reception/reception-review-handoff.test.ts`
  - `src/components/reception/reception-review-step.tsx`
  - `src/components/reception/reception-wizard.tsx` (paso Revisión)
- Features completed:
  - Resumen de cliente, vehículo, km, combustible, checklist, daños y observaciones.
  - Confirmación llama `receptionService.complete` + `workOrderService.createFromReception`.
  - Draft incompleto (checklist vacío) bloquea confirmar. Reclick reutiliza la OT existente.
  - Estado de éxito con código de OT y enlace a `/taller/ordenes`.
- Tests:
  - `reception-review-handoff.test.ts` 5/5.
  - Lint y typecheck OK.
  - Browser: ABC-123 → revisión bloqueada sin checklist; con Documentos se crea `OT-2026-0216`; al volver sigue la misma OT.
- Remaining issues:
  - El listado de OT es C-013. El detalle operativo es C-014.
