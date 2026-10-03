# CL-002 - Dirección visual y reglas del rediseño Glass

## Agent
Claude

## Status
DONE

## Priority
Critical

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
CL-001; variante elegida por el usuario en la vista previa

## Goal
Dejar por escrito el nuevo lenguaje visual y actualizar las reglas para que los agentes puedan rediseñar.

## Context
Rediseño visual completo con estética de vidrio hecha solo con CSS (`backdrop-filter` + fondo de degradados estático). Sin dependencias nuevas, sin WebGL, solo tema claro. La variante visual la elige el usuario en la vista previa (Paso 0 del plan). Las reglas actuales prohíben rediseñar.

## Scope
- Reescribir `CONVENTIONS.md` como v2 Glass: superficies, niveles de vidrio, fondo, radios, sombras, tipografía, densidad, tablas, estados.
- Quitar de `AGENTS.md` las reglas de 'no rediseñar' y describir la propiedad de archivos durante la fase.
- Documentar qué usa `glass`, `glass-strong` y `glass-subtle` y dónde NO se aplica blur.

## Out of Scope
- No tocar código de componentes ni estilos.

## Expected Files
- src/components/erp/CONVENTIONS.md
- AGENTS.md
- tasks/README.md

## Requirements
- Solo tema claro.
- Contraste AA para texto denso.
- Solo CSS: prohibido WebGL/canvas para el efecto.

## Acceptance Criteria
- [x] CONVENTIONS v2 describe la variante aprobada con clases concretas.
- [x] AGENTS.md ya no prohíbe el rediseño y nombra a Claude y OpenCode como agentes de la fase.

## Verification
- Revisión de documentos (sin código)

## Completion Report
- Files changed: `src/components/erp/CONVENTIONS.md` (nueva §0 Sistema Glass + ajustes), `AGENTS.md`.
- Features completed: variante elegida por el usuario = **Glass medio**. Documentados niveles `glass` / `glass-strong` / `glass-subtle`, dónde no va blur, fondo, radio, legibilidad, fallbacks y receta de migración para el rollout.
- Tests: no aplica (solo documentos).
- Remaining issues: ninguno.
