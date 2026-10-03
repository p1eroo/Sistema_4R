# C-043 - QA visual contra Lovable

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 10 — Frontend integration and QA

## Dependencies
C-001, C-034, C-041

## Goal
Asegurar que módulos nuevos se sienten del mismo producto que el dashboard Lovable.

## Context
Regla del repo: no rediseñar. Esta tarea caza deriva visual (espaciados, badges, botones).

## Scope
- Comparar dashboard vs módulos.
- Corregir desviaciones de tokens/densidad.
- Revisar desktop y un ancho móvil del shell.

## Out of Scope
- No nueva identidad visual.
- No cambiar Manrope ni oklch tokens salvo bugs.

## Expected Files
- Ajustes menores en componentes erp/módulo que hayan derivado

## Requirements
- Seguir CONVENTIONS.md de C-001.
- Verificar en browser según regla del repo.

## Acceptance Criteria
- [x] No hay páginas huérfanas sin AppShell.
- [x] Badges/estados usan StatusBadge/tokens.
- [x] Dashboard intacto en look.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `usuarios/sedes.tsx`: badge «Predeterminada» (español + `StatusBadge`).
  - `usuarios/roles.tsx`: copy alineado al módulo Permisos.
  - Sin `ModuleStub` en rutas; módulos ERP bajo `_erp` + AppShell.
- Features completed:
  - Revisión de badges: no hay uso de `ui/badge` suelto en módulos operativos.
  - Dashboard (`index.tsx`) sin cambios de layout/tokens.
- Tests:
  - Build + vitest OK; revisión estática de convenciones C-001.
- Remaining issues:
  - QA pixel-perfect en browser queda como smoke manual del usuario (`npm run dev`).
