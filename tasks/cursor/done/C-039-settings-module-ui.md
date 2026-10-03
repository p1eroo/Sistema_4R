# C-039 - UI de Configuración

## Agent
Cursor

## Status
DONE

## Priority
Medium

## Phase
PHASE 9 — Users / Branches / Settings

## Dependencies
C-003, O-051, O-052

## Goal
Página de settings de empresa y numeración, sin nueva estética.

## Context
Cierre del menú Configuración. Preferencias del header pueden reutilizar partes.

## Scope
- Ruta `/configuracion`.
- Secciones: empresa, impuestos, numeración, sede default.
- Save con toast sonner.

## Out of Scope
- No dark-mode redesign.
- No env vars / secrets.

## Expected Files
- src/routes/configuracion/index.tsx
- src/components/settings/settings-form.tsx

## Requirements
- Sonner ya está en deps.
- Valores iniciales del seed O-051.

## Acceptance Criteria
- [x] Se edita razón social y persiste en mock.
- [x] IGV 18% visible.
- [x] Layout AppShell.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/settings/settings-form.tsx`, `src/routes/_erp/configuracion/index.tsx`.
  - `Toaster` montado en `app-shell.tsx`.
- Features completed:
  - Formulario empresa, IGV, numeración y sede predeterminada vía `settingsService` + `branchService`.
  - Toast Sonner al guardar.
- Tests:
  - `npm run build` OK; tests existentes de settings sin regresión.
- Remaining issues:
  - Typecheck global con deuda previa no relacionada.
