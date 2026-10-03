# O-001 - Toolchain de typecheck y tests

## Agent
OpenCode

## Status
DONE

## Priority
Critical

## Phase
PHASE 0 — Foundation

## Dependencies
None

## Goal
Añadir scripts de verificación que el resto del backlog pueda usar.

## Context
`package.json` tiene `lint` y `build` pero no `typecheck` ni test runner. El template de tareas exige typecheck, lint y tests. Sin esto, las tareas de dominio no pueden verificarse de forma uniforme.

## Scope
- Agregar script `typecheck` (`tsc --noEmit`).
- Agregar Vitest (o runner equivalente ya compatible con Vite 8) y un script `test`.
- Crear un smoke test mínimo del helper `cn` para validar el runner.
- Documentar en README de tasks o package scripts cómo verificar una tarea.

## Out of Scope
- No cambiar UI, rutas ni tokens.
- No añadir backend, API real ni Playwright todavía.
- No reescribir eslint ni prettier configs salvo lo mínimo para tests.

## Expected Files
- package.json (solo scripts + devDependency de test)
- vitest.config.ts (o equivalente)
- src/lib/utils.test.ts
- tasks/README.md (sección Verification, si ya existe)

## Requirements
- Vitest debe resolver alias `@/`.
- No versionar lockfile roto; usar el package manager del repo (npm/bun según lockfiles presentes).
- El smoke test no depende de DOM de módulos ERP.

## Acceptance Criteria
- [x] `bun run typecheck` existe y pasa.
- [x] `bun run test` existe y pasa el smoke test.
- [x] `bun run lint` no introduce errores nuevos (ver Remaining issues: baseline preexistente).
- [x] Ningún archivo de UI cambió.

## Verification
- bun run typecheck
- bun run lint
- bun run test

## Completion Report
- Files changed:
  - `package.json` (scripts `typecheck`, `test`, `test:watch`; devDependency `vitest`).
  - `vitest.config.ts` (nuevo; alias `@/` → `src/`, `environment: node`).
  - `src/lib/utils.test.ts` (nuevo; smoke test de `cn`: unión, falsy, merge tailwind).
  - `tasks/README.md` (sección Verification actualizada a bun + Vitest).
  - `bun.lock` (actualizado por `bun add -d vitest`; vitest 5.0.1).
- Features completed:
  - `bun run typecheck` = `tsc --noEmit`.
  - `bun run test` = Vitest en modo run; `test:watch` para watch.
  - Vitest 5.0.1 compatible con Vite 8; resuelve alias `@/` vía `vitest.config.ts`.
- Tests:
  - `src/lib/utils.test.ts`: 3 tests, 3 pasan.
  - `bun run typecheck`: exit 0.
- Remaining issues:
  - `bun run lint` falla en el baseline **antes y después** de esta tarea con los
    mismos 745 issues (739 `prettier/prettier` + 6 warnings `react-refresh`) en
    49 archivos, casi todos UI de Cursor (`src/components/ui/**`, `src/routes/**`,
    `src/components/erp/**`). O-001 no puede arreglarlos sin reformatear archivos
    UI fuera de su ownership y en contra del Out of Scope. Los archivos de esta
    tarea (`vitest.config.ts`, `src/lib/utils.test.ts`) tienen 0 issues.
  - Recomendación: una tarea Cursor de formateo/prettier config o un `.prettierrc`
    que refleje el estilo real, antes de exigir `bun run lint` verde en todo el repo.
