# Task system — 4 RUEDAS frontend

Backlog operativo para completar el prototipo frontend con mocks.
El tablero vivo está en [`TASKS.md`](./TASKS.md).

## Layout

```
tasks/
  TASKS.md
  README.md
  cursor/
    todo/
    doing/
    done/
  opencode/
    todo/
    doing/
    done/
  claude/
    todo/
    doing/
    done/
  blocked/
```

Un archivo Markdown = una tarea. IDs:

- Cursor: `C-001`, `C-002`, …
- OpenCode: `O-001`, `O-002`, …
- Claude: `CL-001`, `CL-002`, …

Ejemplo: `tasks/cursor/todo/C-001-design-system-audit.md`

## Agent ownership

**Cursor** toma decisiones de arquitectura, design system, UI/UX compleja, workflows, estado cruzado e integración.

**Claude** (`tasks/claude/`, IDs `CL-NNN`) toma el rediseño Glass de PHASE 11: tokens, shell, primitivos de referencia, pantallas complejas y QA final.

**OpenCode** toma tipos, schemas Zod, seeds, mock services, helpers, CRUD/tablas/forms simples, data-states y tests.

No asignar ambos agentes al mismo archivo al mismo tiempo. Si una tarea UI necesita un form de OpenCode, Cursor lo importa; no lo reescribe.

## Workflow

`todo` → `doing` → `done`

Al **empezar**:

1. Mover el archivo de `todo/` a `doing/`.
2. Cambiar `Status` a `IN_PROGRESS`.
3. Actualizar `TASKS.md` (quitar de TODO, listar en DOING).

Al **terminar**:

1. Correr Verification (`typecheck`, `lint`, `tests` si aplica).
2. Completar `Completion Report`.
3. Cambiar `Status` a `DONE`.
4. Mover el archivo de `doing/` a `done/`.
5. Actualizar `TASKS.md`.

Si está **bloqueada**:

1. `Status: BLOCKED` y documentar el blocker.
2. Mover a `tasks/blocked/`.
3. Actualizar `TASKS.md`.

Nunca mover a `done` una tarea fallida o incompleta.

## Task template

Cada archivo incluye: Agent, Status, Priority, Dependencies, Goal, Context, Scope, Out of Scope, Expected Files, Requirements, Acceptance Criteria, Verification, Completion Report.

## Verification

El repo usa **npm** (`package-lock.json`). Verificación estándar (desde O-001):

```sh
npm run lint
npm run typecheck
npm run test
```

- `npm run typecheck` → `tsc --noEmit`.
- `npm run test` → Vitest (`vitest run`); `npm run test:watch` para modo watch.
- `npm run lint` corre ESLint + Prettier (`.prettierrc`). Debe quedar en 0.
  Formatear con `npx prettier --write <archivos>` o `npm run format`.

## What already exists (do not rebuild)

- TanStack Start + file-based routing
- `AppShell`, `AppSidebar`, `AppHeader`
- Design tokens (`primary`, `success`, `warning`, `info`, `critical`)
- shadcn/Radix primitives
- Dashboard visual en `/`

## Product constraint

Frontend only. No API real. La fuente visual es `src/components/erp/CONVENTIONS.md`. Cada tarea debe dejar el proyecto en estado usable.
