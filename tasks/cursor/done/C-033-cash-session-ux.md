# C-033 - UX de sesión de caja

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 6 — POS and payments

## Dependencies
C-031, O-046

## Goal
Abrir/cerrar caja y mostrar el turno real en el footer del sidebar.

## Context
El footer de AppSidebar está hardcodeado. Esta tarea lo conecta sin rediseñarlo.

## Scope
- UI de apertura/cierre/arqueo simple.
- Sustituir textos hardcodeados del footer por getCurrent().
- Estado caja cerrada.

## Out of Scope
- No rediseñar el footer.
- No contabilidad.
- No cambiar pos-cart.

## Expected Files
- src/components/pos/cash-session-panel.tsx
- src/components/erp/app-sidebar.tsx (solo bloque footer)

## Requirements
- No tocar el menú (propiedad compartida: solo footer).
- Textos en español.

## Acceptance Criteria
- [x] Footer muestra turno mock 08:00 cuando está abierta.
- [x] Cerrar caja actualiza el footer.
- [x] No se puede vender si la caja está cerrada (guard en POS).

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/pos/cash-session-panel.tsx`
  - `src/components/pos/use-cash-session.ts`
  - `src/components/pos/cash-session-format.ts`
  - `src/components/pos/cash-session-format.test.ts`
  - `src/components/erp/app-sidebar.tsx` (footer)
  - `src/components/pos/pos-shell.tsx` (guard, sin editar pos-cart)
- Features completed:
  - Footer clickeable con `getCurrent("molina")` y turno Lima.
  - Panel abrir/cerrar caja con arqueo simple.
  - POS bloquea catálogo y cobro si la caja está cerrada.
- Tests:
  - `cash-session-format.test.ts` 1/1.
  - ESLint OK en archivos C-033.
- Remaining issues:
  - Arqueo avanzado queda fuera de alcance.
