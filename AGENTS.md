<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Package manager

This project uses **npm** as the only package manager.

- Detected / declared version: `npm@11.19.0` (`package.json` → `packageManager`).
- The only lockfile is `package-lock.json`.
- Do not create or commit `bun.lock`, `bun.lockb`, `yarn.lock`, or `pnpm-lock.yaml`.
- Do not run `bun`, `bun install`, `bun add`, or `bun run`. Use `npm install` and `npm run <script>`.
- Verification commands: `npm run typecheck`, `npm run test`, `npm run lint`, `npm run build`.
- Prettier is required. Config lives in `.prettierrc`. Format with `npx prettier --write <files>` or `npm run format` (respects `.prettierignore`). Do not disable `prettier/prettier` to hide baseline drift.

## Project architecture

- All ERP modules must reuse the shared `AppShell`, sidebar, header, semantic tokens, and ERP UI primitives because the product must remain visually coherent across every workflow.
- This repository is frontend-only.
- Persist nothing to a real backend; use in-memory mock services or frontend mock repositories.
- Do not redesign the Lovable UI.
- The current dashboard, layout, spacing, typography, tokens, and interaction patterns are the visual source of truth.
- Prefer extending existing components over creating duplicate alternatives.
- Do not introduce Material UI unless explicitly requested.
- Prefer the existing shadcn/ui, Tailwind, Radix, and Lucide stack.
- Do not add new dependencies unless the assigned task clearly requires them.
- Do not modify unrelated modules.

## Task workflow

Work is coordinated from `tasks/`.

The live board is:

`tasks/TASKS.md`

Read:

`tasks/README.md`

before starting work.

Task locations:

- Cursor tasks:
  `tasks/cursor/{todo,doing,done}`
  IDs: `C-NNN`

- OpenCode tasks:
  `tasks/opencode/{todo,doing,done}`
  IDs: `O-NNN`

- Blocked tasks:
  `tasks/blocked/`

### Starting a task

Before starting:

1. Read `AGENTS.md`.
2. Read `tasks/TASKS.md`.
3. Read the complete assigned task file.
4. Verify all listed dependencies are `DONE`.
5. Inspect the existing implementation before editing.
6. Confirm the task does not conflict with another active agent.

Then:

- move the task file from `todo` to `doing`
- change Status to `IN_PROGRESS`
- update `tasks/TASKS.md`

### Completing a task

Before marking a task as complete:

1. Complete the defined scope.
2. Check all acceptance criteria.
3. Run the task verification commands.
4. Fix failures caused by the task.
5. Fill the Completion Report.

Then:

- set Status to `DONE`
- move the task file from `doing` to `done`
- update `tasks/TASKS.md`

Never move incomplete or failed work to `done`.

### Blocked tasks

If a task cannot safely continue:

- set Status to `BLOCKED`
- describe the blocker
- describe what decision or dependency is required
- move the task file to `tasks/blocked/`
- update `tasks/TASKS.md`
- stop work on that task

Do not invent missing requirements.

## Agent ownership

Cursor should primarily handle:

- architecture-sensitive frontend changes
- complex UI
- complex UX workflows
- cross-module integration
- design system work
- advanced workshop flows
- Vehicle Reception
- Work Order detail
- inspection / damage mapping
- Estimate Builder
- WIP / Kanban
- POS interactions
- complex dashboards
- final visual integration

OpenCode should primarily handle:

- TypeScript types
- interfaces
- enums
- Zod schemas
- mock datasets
- mock repositories
- mock services
- utility functions
- filters
- pagination
- simple tables
- simple forms
- loading / empty / error states
- tests
- repetitive frontend implementation

Do not have Cursor and OpenCode edit the same files at the same time.

Prefer the file ownership and Expected Files sections defined in each task.

If a task requires modifying files owned by another active task, stop and report the conflict first.

## Task execution modes

### Single Task Mode

Use this mode when the user assigns one specific task.

Workflow:

1. Read `AGENTS.md`.
2. Read `tasks/TASKS.md`.
3. Execute only the assigned task.
4. Follow `todo -> doing -> done`.
5. Run verification.
6. Update `tasks/TASKS.md`.
7. Stop after completing or blocking the task.

Do not automatically start another task.

### Continuous Task Mode

Use this mode only when the user explicitly says to:

- continue tasks
- continue development
- process multiple tasks
- enter continuous mode
- work through the backlog

Workflow:

1. Read `AGENTS.md`.
2. Read `tasks/TASKS.md`.
3. Look only at tasks assigned to your agent.
4. Ignore tasks whose dependencies are not `DONE`.
5. Ignore tasks that conflict with active work.
6. Select the highest-priority available task.
7. Move it from `todo` to `doing`.
8. Set Status to `IN_PROGRESS`.
9. Execute only that task's scope.
10. Verify the task.
11. If successful:
    - fill the Completion Report
    - set Status to `DONE`
    - move the task from `doing` to `done`
    - update `tasks/TASKS.md`
12. Immediately select the next available task.
13. Repeat until the run limit is reached or a stop condition occurs.

### Recommended run limits

Unless the user explicitly requests a different limit:

Cursor:
- maximum 3 tasks per continuous run

OpenCode:
- maximum 5 tasks per continuous run

This prevents large uncontrolled batches of changes.

## Stop conditions

In continuous mode, stop when any of the following occurs:

- the run task limit is reached
- there are no available tasks for your agent
- all remaining tasks have incomplete dependencies
- a required architectural decision is unclear
- user approval is required
- verification fails and cannot be safely fixed
- another agent is modifying conflicting files
- the task scope requires backend implementation
- requirements are ambiguous enough to risk incorrect implementation

When stopping, report:

- tasks completed
- tasks blocked
- verification results
- next available task
- pending dependencies
- any decision required from the user

## Verification rules

Respect the verification commands already defined by the repository and each task.

At minimum, when applicable, run them with **npm**:

- `npm run typecheck`
- `npm run lint`
- `npm run test`

Do not fix unrelated legacy warnings or formatting problems unless the assigned task explicitly includes cleanup.

Do not rewrite unrelated files merely to make a global lint command completely clean.

Report pre-existing issues separately from issues introduced by the current task.

## Frontend-only boundary

The current project phase is frontend prototype development.

Do not create:

- NestJS backend
- Prisma schema
- PostgreSQL database
- API server
- real authentication server
- real payment integrations

Use mock services with API-like interfaces so they can later be replaced by real HTTP implementations without rewriting the UI.

Business-oriented frontend services should prefer interfaces such as:

- `getAll()`
- `getById()`
- `search()`
- `create()`
- `update()`
- `archive()`

Avoid hardcoding large datasets directly inside page components.