# O-016 - Formulario simple de Vehicle

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
O-012, O-014

## Goal
Formulario create/edit de vehículo, incluyendo selector de customerId.

## Context
Cursor usará este form en list/detail y en recepción (alta rápida).

## Scope
- VehicleForm: placa, marca, modelo, año, color, km, combustible, customerId.
- Validación Zod O-012.
- customerId puede venir prefijado (alta desde ficha de cliente).

## Out of Scope
- No rutas.
- No damage map.
- No listado.

## Expected Files
- src/components/vehicles/vehicle-form.tsx

## Requirements
- Primitivos UI existentes.
- No fetch directo en el form: recibe customers[] y onSubmit.

## Acceptance Criteria
- [x] Submit entrega payload válido.
- [x] Placa inválida muestra error en español.
- [x] lint/typecheck pasan.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/components/vehicles/vehicle-form.tsx` (`VehicleForm`, `VehicleFormProps`, `VehicleFormValues`, `VehicleCustomerOption`).
- Features completed:
  - Form create/edit con react-hook-form + `zodResolver(vehicleCreateSchema)` (O-012).
  - Campos: cliente, placa, color, marca, modelo, año, kilometraje y combustible.
  - `lockedCustomerId` para alta desde ficha de cliente; select de cliente poblado por prop `customers`.
  - Números parseados de forma segura (vacío → `undefined` para que el schema muestre el error en español).
  - Sin rutas ni fetch: recibe `customers` y `onSubmit` tipado.
- Tests:
  - La validación (incluida placa inválida) vive en `vehicleCreateSchema` (probada en O-012); el form no introduce lógica pura, por eso no se añade test de render.
  - Suite completa: 94/94 pasan. `npm run typecheck` exit 0; `eslint` del archivo OK.
- Remaining issues:
  - Sin test de render (requeriría jsdom + Testing Library, no instalados; fuera de alcance).
  - `npm run lint` global hereda el baseline Prettier; el archivo de O-016 tiene 0 issues.
