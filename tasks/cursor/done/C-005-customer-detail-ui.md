# C-005 - UI detalle de Cliente

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
C-004, O-010, O-014

## Goal
Ficha de cliente con datos, vehículos asociados y acciones de edición.

## Context
La recepción y el POS partirán de esta ficha. El detalle es UX de Cursor.

## Scope
- Ruta `/clientes/$id`.
- Resumen, edición vía O-015, lista de vehículos del cliente (datos O-014).
- CTA agregar vehículo (form O-016 o navegación).

## Out of Scope
- No historial de OT (C-023).
- No POS.
- No modificar services de OpenCode.

## Expected Files
- src/routes/clientes/$id.tsx
- src/components/customers/customer-detail.tsx

## Requirements
- 404/ErrorState si el id no existe.
- Reusar PageHeader.
- No nueva paleta.

## Acceptance Criteria
- [x] Lucía Ramos (o seed equivalente) muestra sus vehículos.
- [x] Editar persiste en el mock.
- [x] lint/typecheck pasan.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/customers/customer-detail.tsx`
  - `src/routes/_erp/clientes/$id.tsx` (reemplaza el stub de C-004)
- Features completed:
  - Ficha de cliente con `getById` + vehículos `listByCustomer`.
  - Dialog de edición vía O-015; persistencia en mock y recarga.
  - Dialog agregar vehículo vía O-016 con `lockedCustomerId`.
  - Chrome override con `displayName`. EmptyState 404 si el id no existe.
  - Chip de placa `ABC-123` en la unidad de Lucía Ramos.
- Tests:
  - `npm run typecheck` OK.
  - Lint de archivos de la tarea OK.
  - Browser: Lucía Ramos / CUS-0001 muestra ABC-123; notas «Cliente frecuente La Molina» se guardan.
- Remaining issues:
  - Historial de OT queda para C-023.
