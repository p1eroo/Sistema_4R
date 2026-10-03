# C-027 - UI de Proveedores

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 4 — Products / Services / Suppliers

## Dependencies
C-003, O-036

## Goal
Listado y ficha de proveedores listos para compras.

## Context
Phase 5 necesita elegir proveedor. El menú ya tiene el ítem plano.

## Scope
- Rutas `/proveedores` y `/proveedores/$id`.
- Tabla, búsqueda RUC/nombre, ficha de contacto.

## Out of Scope
- No órdenes de compra.
- No cuentas por pagar reales.

## Expected Files
- src/routes/proveedores/index.tsx
- src/routes/proveedores/$id.tsx
- src/components/suppliers/supplier-list.tsx

## Requirements
- Form simple aceptable aquí o dialog; densidad ERP.
- Query O-036.

## Acceptance Criteria
- [x] Se listan seeds.
- [x] Crear proveedor funciona.
- [x] Ficha muestra RUC y contacto.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/proveedores/index.tsx`
  - `src/routes/_erp/proveedores/$id.tsx`
  - `src/components/suppliers/supplier-list.tsx`
  - `src/components/suppliers/supplier-form.tsx`
  - `src/components/suppliers/supplier-detail.tsx`
- Features completed:
  - Listado seed (6) con búsqueda RUC/nombre y alta por dialog.
  - Ficha SUP-0001: RUC 20512345678, Ana Salas, 30 días.
  - Alta Filtros Lima SAC (20123456789 / Pedro Ruiz / 987777888) → `/proveedores/SUP-0007`.
- Tests:
  - ESLint de archivos C-027 OK.
  - Browser: seeds, ficha seed y create.
- Remaining issues:
  - Ninguno para el alcance. Órdenes de compra en C-028.
