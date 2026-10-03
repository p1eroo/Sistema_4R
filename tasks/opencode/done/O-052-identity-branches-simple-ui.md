# O-052 - Forms y tablas simples de identidad y sedes

## Agent
OpenCode

## Status
DONE

## Priority
Medium

## Phase
PHASE 9 — Users / Branches / Settings

## Dependencies
O-049, O-050, O-051, C-003

## Goal
CRUD tabular de usuarios, roles y sedes; settings form plano opcional.

## Context
OpenCode hace forms/tablas simples. Cursor (C-038/C-039) hace la UX de permisos y settings pulida.

## Scope
- Rutas `/usuarios`, `/usuarios/roles`, `/usuarios/sedes`.
- Tablas + dialogs.
- No matriz de permisos compleja.

## Out of Scope
- No matriz de permisos (C-038).
- No rediseñar header.
- No settings visual final (C-039).

## Expected Files
- src/routes/usuarios/index.tsx
- src/routes/usuarios/roles.tsx
- src/routes/usuarios/sedes.tsx
- src/components/identity/user-table.tsx

## Requirements
- Carlos visible en la tabla.
- ModulePage.

## Acceptance Criteria
- [x] Se lista Carlos Mendoza.
- [x] Crear usuario mock funciona.
- [x] Sedes editables.

## Verification
- npm run lint
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/components/identity/user-table.tsx` (`UserList`: tabla + búsqueda + dialog de alta).
  - `src/routes/_erp/usuarios/index.tsx` (usuarios).
  - `src/routes/_erp/usuarios/roles.tsx` (roles con conteo de permisos).
  - `src/routes/_erp/usuarios/sedes.tsx` (sedes con dialog editable).
- Features completed:
  - Tabla de usuarios con roles/sedes/estado (Carlos Mendoza visible) y alta simple vía `identityService.createUser`.
  - Roles en tabla simple (sin matriz de permisos, reservada a C-038).
  - Sedes editables (nombre, dirección, teléfono, capacidad, default) vía `branchService.update`.
- Tests:
  - UI sin lógica pura nueva; suite completa 294/294 pasan.
- Remaining issues:
  - **Rutas** implementadas sobre `src/routes/_erp/usuarios/*` (patrón real), no `src/routes/usuarios/*`.
  - Matriz de permisos y settings visual final quedan para C-038/C-039.
