# CL-011 - Capas flotantes en vidrio medio y menús con tipografía de ERP

## Agent
Claude

## Status
DONE

## Priority
High

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-005

## Goal
Tema general suave, con vidrio medio en lo que flota (menús, popovers, diálogos, header, sidebar), y menús con texto y densidad de ERP profesional.

## Context
Pedido del usuario tras probar las variantes: prefiere el tema suave, pero el vidrio medio en algunos elementos, y popovers con aspecto profesional. Estos primitivos estaban asignados a O-055; se adelantaron aquí.

## Scope
- Utilidad `glass-float` y tokens `--glass-float-*`, `--glass-shell-bg` en `src/styles.css`.
- `popover`, `dropdown-menu`, `select`, `context-menu`, `menubar`, `hover-card`, `command`, `tooltip`, `dialog`, `sheet`.

## Out of Scope
- Resto de primitivos (siguen en O-055).

## Acceptance Criteria
- [x] Menús, selects y popovers usan `glass-float` con items de 13px y altura 32px.
- [x] Header y sidebar con vidrio medio; tarjetas de contenido siguen en vidrio suave.
- [x] Sin cambios de props.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed: `src/styles.css`, `src/components/ui/{popover,dropdown-menu,select,context-menu,menubar,hover-card,command,tooltip,dialog,sheet}.tsx`, `src/components/erp/collapsed-nav-flyout.tsx`, `src/components/erp/CONVENTIONS.md`.
- Features completed: vidrio medio en capas flotantes y shell; tipografía y densidad de menús unificadas; tooltip oscuro; títulos de diálogo más compactos.
- Tests: typecheck, lint (0 errores) y tests OK. Capturas reales con menú de sede y select de marca abiertos.
- Ajuste posterior (pedido del usuario, con imagen de referencia): `Dialog` y `AlertDialog` pasan a modal blanco opaco, `rounded-3xl`, cabecera con divisor y X redonda, etiquetas `text-xs font-semibold`, botones del pie en píldora. Verificado con capturas de "Nueva cita" y "Nuevo anticipo de cliente". Se quitó `sm:gap-0` de 5 `DialogFooter` del POS.
- Remaining issues: diálogos, sheets, popover de descuento y tooltips no se capturaron abiertos.
