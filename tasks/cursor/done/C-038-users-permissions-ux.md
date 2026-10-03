# C-038 - UX de usuarios y permisos

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 9 — Users / Branches / Settings

## Dependencies
C-003, O-049, O-052

## Goal
Matriz de permisos y ficha de usuario coherente con el ERP.

## Context
Más que una tabla: entender qué puede hacer un asesor vs admin.

## Scope
- Ruta `/usuarios/permisos` + mejora de ficha `/usuarios/$id`.
- Matriz rol × permiso.
- Estados empty/error.

## Out of Scope
- No auth real.
- No reescribir user-table.tsx salvo composición.

## Expected Files
- src/routes/usuarios/permisos.tsx
- src/routes/usuarios/$id.tsx
- src/components/identity/permission-matrix.tsx

## Requirements
- can() de O-049.
- No inventar roles fuera del seed sin persistirlos.

## Acceptance Criteria
- [x] Se ve la matriz.
- [x] Cambiar un permiso se refleja en can() mock.
- [x] Ficha de Carlos muestra Administrador.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/identity/permission-matrix.tsx`, `user-detail.tsx`; rutas `_erp/usuarios/permisos.tsx`, `$id.tsx`.
  - `src/mocks/identity/service.ts` (`setRolePermission`), `service.test.ts`.
  - Enlace al detalle en `user-table.tsx`.
- Features completed:
  - Matriz rol × permiso con switches (admin bloqueado).
  - Ficha de usuario con roles, sedes y muestra de `can()`.
  - `/usuarios/USR-0001` muestra Carlos Mendoza como Administrador.
- Tests:
  - `identity/service.test.ts`; suite 332/332.
- Remaining issues:
  - `npm run typecheck` sigue con errores previos (`delivery-form.tsx`, dashboard readonly).
