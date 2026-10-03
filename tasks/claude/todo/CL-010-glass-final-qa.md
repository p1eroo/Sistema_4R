# CL-010 - QA final del rediseño Glass

## Agent
Claude

## Status
TODO

## Priority
High

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-004 a CL-009 y O-055 a O-062

## Goal
Cerrar la fase con una revisión visual, de accesibilidad y de rendimiento de todo el sistema.

## Context
Rediseño visual completo con estética de vidrio hecha solo con CSS (`backdrop-filter` + fondo de degradados estático). Sin dependencias nuevas, sin WebGL, solo tema claro. La variante visual la elige el usuario en la vista previa (Paso 0 del plan).

## Scope
- Recorrer todas las rutas de `ALL_NAV_PATHS`.
- Verificar contraste AA, foco visible y `prefers-reduced-transparency`.
- Medir fluidez del scroll con blur en páginas densas y ajustar.
- Corregir inconsistencias entre módulos.

## Out of Scope
- No agregar funcionalidades.

## Expected Files
- Ajustes puntuales en cualquier módulo
- src/components/erp/CONVENTIONS.md (notas finales)

## Requirements
- Reportar problemas preexistentes por separado.

## Acceptance Criteria
- [ ] Ninguna ruta conserva el estilo anterior.
- [ ] Sin superficies ad-hoc fuera de `Surface`.
- [ ] Informe de QA en el Completion Report.

## Verification
- npm run typecheck
- npm run lint
- npm run test
- npm run build

## Completion Report
- Files changed:
- Features completed:
- Tests:
- Remaining issues:
