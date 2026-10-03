# O-015 - Formulario simple de Customer

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 1 — Customers and Vehicles

## Dependencies
O-008, O-010

## Goal
Formulario create/edit de cliente con react-hook-form + Zod, sin página de listado.

## Context
OpenCode posee formularios simples. Cursor montará el form en C-004/C-005.

## Scope
- CustomerForm controlado (create/edit).
- Campos: tipo, documento, nombres/razón social, teléfonos, email, dirección, sede.
- Estados de submit/error usando data-states o Form de shadcn.

## Out of Scope
- No crear `src/routes/clientes/*` (Cursor).
- No rediseñar inputs.
- No listado ni detalle.

## Expected Files
- src/components/customers/customer-form.tsx

## Requirements
- Usar `@/components/ui/form`, Input, Select existentes.
- Resolver Zod de O-008.
- Textos en español.

## Acceptance Criteria
- [x] El form valida y llama onSubmit con payload tipado.
- [x] No navega ni crea rutas.
- [x] lint/typecheck pasan.

## Verification
- npm run lint (archivos propios)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/components/customers/customer-form.tsx` (`CustomerForm`, `CustomerFormProps`, `CustomerFormValues`).
- Features completed:
  - Form create/edit con react-hook-form + `zodResolver(customerCreateSchema)` (O-008).
  - Campos: tipo, documento (DNI/RUC/CE, forzado a RUC si empresa), número, nombres/razón social, teléfonos con `useFieldArray`, email, sede preferida (`branches` prop) y dirección/notas.
  - Cambiar a empresa fuerza `documentType = RUC`; CTA y cancelar configurables por props.
  - Sin rutas ni fetch: recibe `branches` y `onSubmit` tipado.
- Tests:
  - La validación vive en `customerCreateSchema` (probada en O-008); el form no introduce lógica pura, por eso no se añade test de render.
  - Suite completa: 94/94 pasan. `npm run typecheck` exit 0; `eslint` del archivo OK.
- Remaining issues:
  - Sin test de render (requeriría jsdom + Testing Library, no instalados; fuera de alcance).
  - `npm run lint` global hereda el baseline Prettier; el archivo de O-015 tiene 0 issues.
