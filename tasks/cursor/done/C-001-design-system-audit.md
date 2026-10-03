# C-001 - Auditoría del design system Lovable

## Agent
Cursor

## Status
DONE

## Priority
Critical

## Phase
PHASE 0 — Foundation

## Dependencies
None

## Goal
Documentar el sistema visual existente como única fuente de verdad y bloquear rediseños.

## Context
El prototipo Lovable ya define AppShell, sidebar, header, tokens semánticos (primary, success, warning, info, critical) y primitivos ERP (MetricCard, SectionCard, StatusBadge). El dashboard en `src/routes/index.tsx` es el lenguaje visual del producto. Sin esta auditoría, los módulos siguientes arriesgan inventar otra UI.

## Scope
- Inventariar tokens en `src/styles.css` y primitivos en `src/components/ui` y `src/components/erp`.
- Documentar convenciones de densidad, tipografía Manrope, badges, cards, tablas y CTAs críticos.
- Definir qué se reutiliza tal cual y qué huecos existen (page header, estados de datos, breadcrumbs dinámicos).
- Escribir una guía corta de implementación para el resto del backlog.

## Out of Scope
- No rediseñar colores, tipografía, layout ni el dashboard.
- No crear rutas de módulos.
- No cambiar AppSidebar, AppHeader ni Dashboard salvo correcciones factuales de documentación.

## Expected Files
- src/components/erp/CONVENTIONS.md (nuevo, solo Cursor)
- src/styles.css (solo lectura salvo error factual)
- src/components/erp/* (solo lectura)
- src/routes/index.tsx (solo lectura)

## Requirements
- Tratar el dashboard actual como source of truth visual.
- Registrar tokens ya existentes: `--success`, `--warning`, `--info`, `--critical`, sidebar y charts.
- Prohibir nuevas paletas o componentes genéricos que dupliquen shadcn.
- Listar primitivos ERP faltantes sin implementarlos aquí (eso es C-003 / O-006).

## Acceptance Criteria
- [x] Existe `src/components/erp/CONVENTIONS.md` con tokens, primitivos, densidad y reglas de reuso.
- [x] La guía indica explícitamente que no se rediseña el producto.
- [x] Se listan huecos reales (navegación muerta, breadcrumbs fijos, datos hardcodeados) sin proponer otra estética.
- [x] Lint no rompe; no hay cambios visuales en `/`.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/components/erp/CONVENTIONS.md` (nuevo)
  - `tasks/TASKS.md` (tablero)
  - este archivo (`todo` → `doing` → `done`)
- Features completed:
  - Inventario de tokens (`primary`, `success`, `warning`, `info`, `critical`, sidebar, charts).
  - Inventario de primitivos ERP y shadcn.
  - Convenciones de densidad, tipografía Manrope, badges, cards, CTAs críticos y copy canónico.
  - Huecos factuales listados sin implementar ni rediseñar (nav muerta, breadcrumbs fijos, data-states, datos hardcodeados, bahías ausentes).
  - Primitivos faltantes asignados a C-003 / O-006.
- Tests:
  - `npx tsc --noEmit` pasa.
  - No se añadieron tests: la tarea no introduce lógica.
- Remaining issues:
  - `npm run lint` ya fallaba en el repo Lovable (745 errores Prettier preexistentes). C-001 no tocó TS/TSX; no se aplicó `--fix` para no reescribir el UI.
  - Tokens dark incompletos (success/warning/info/critical) documentados, no corregidos.
  - Siguiente Cursor desbloqueada: C-002.
