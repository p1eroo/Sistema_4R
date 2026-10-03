# O-049 - Tipos y mock de usuarios, roles y permisos

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 9 — Users / Branches / Settings

## Dependencies
O-002, O-005

## Goal
Usuarios del prototipo (Carlos Mendoza admin) + roles/permisos frontend.

## Context
Header muestra Carlos Mendoza / Administrador. El menú tiene Usuarios, Roles, Permisos.

## Scope
- User, Role, Permission types.
- RBAC simple can(user, permission).
- Seed Carlos + 3–5 usuarios.
- CRUD mock + tests can().

## Out of Scope
- No auth real / login backend.
- No UI (C-038 / O-052).

## Expected Files
- src/domain/identity/types.ts
- src/mocks/identity/seed.ts
- src/mocks/identity/service.ts
- src/lib/can.ts
- src/lib/can.test.ts

## Requirements
- Permisos por módulo (workshop, pos, inventory, settings).
- Carlos tiene admin.

## Acceptance Criteria
- [x] can(carlos, 'settings.manage') true.
- [x] Usuario asesor no gestiona usuarios.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/identity/types.ts` (User, Role, Permission, PERMISSIONS, UserStatus, labels).
  - `src/domain/identity/index.ts` (barrel).
  - `src/lib/can.ts` (`permissionsForRoles`, `can`).
  - `src/lib/can.test.ts` (nuevo).
  - `src/mocks/identity/seed.ts` (5 roles, 5 usuarios incl. Carlos Mendoza admin).
  - `src/mocks/identity/service.ts` (`createIdentityService`, `identityService`).
- Features completed:
  - RBAC simple por módulo; `can(user, permission, roles)` con permisos derivados de roles.
  - CRUD mock de usuarios (email único) + listado de roles.
- Tests:
  - `can.test.ts`: 4 tests (admin, asesor, técnico/cajero, merge de permisos).
  - Suite completa: 271/271 pasan.
- Remaining issues:
  - Sin auth/login real (fuera de alcance).
  - `npm run lint` global verde; archivos de O-049 con 0 issues.
