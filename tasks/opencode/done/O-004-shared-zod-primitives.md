# O-004 - Schemas Zod compartidos

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 0 — Foundation

## Dependencies
O-002

## Goal
Schemas reutilizables de placa, documento, teléfono, dinero y paginación.

## Context
Zod y react-hook-form ya están en dependencias, pero no hay schemas de negocio. Perú: DNI/RUC, placas, teléfonos, moneda PEN.

## Scope
- Schemas: money, plate (ABC-123 / B4X-521), dni, ruc, phone, email, pagination, isoDate.
- Mensajes de error en español.
- Tests de parseo válido/inválido.

## Out of Scope
- No schemas de Customer/Vehicle/OT (van en sus tareas).
- No conectar react-hook-form todavía.
- No UI.

## Expected Files
- src/domain/shared/schemas.ts
- src/domain/shared/schemas.test.ts

## Requirements
- Usar Zod 3 ya instalado.
- Placas aceptan el formato visible en el dashboard (`ABC-123`, `B4X-521`, `F6T-884`).
- Money schema alinea con céntimos de O-002.

## Acceptance Criteria
- [x] Schemas exportados y testeados.
- [x] Errores en español.
- [x] typecheck, lint y tests pasan (archivos propios).

## Verification
- bun run typecheck
- bun run lint (archivos propios)
- bun run test

## Completion Report
- Files changed:
  - `src/domain/shared/schemas.ts` (plate, dni, ruc, phone, email, isoDate, money, pagination).
  - `src/domain/shared/schemas.test.ts` (nuevo).
- Features completed:
  - Placas `ABC-123` / `B4X-521` / `F6T-884` con normalización a mayúsculas.
  - DNI (8), RUC (11), celular PE (`9XXXXXXXX` / `+51...`), email, fecha ISO con offset.
  - `moneySchema` alineado con céntimos enteros de O-002 y moneda PEN.
  - `paginationSchema` alineado con el tipo `Pagination`.
  - Mensajes de error en español.
- Tests:
  - `src/domain/shared/schemas.test.ts`: 11 tests (válidos/inválidos y mensajes).
  - Suite completa: 36/36 pasan. `bun run typecheck` exit 0.
- Remaining issues:
  - RUC solo valida longitud, sin dígito verificador (suficiente para el prototipo).
  - `bun run lint` global sigue con el baseline prettier preexistente; los archivos de O-004 tienen 0 issues.
