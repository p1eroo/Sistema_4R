# CL-001 - Quitar Lovable y poner favicon de 4 RUEDAS

## Agent
Claude

## Status
DONE

## Priority
Critical

## Phase
PHASE 11 — Rediseño Glass

## Dependencies
Ninguna

## Goal
Eliminar toda dependencia y mención de Lovable y usar el ícono de 4 RUEDAS en la pestaña del navegador.

## Context
El proyecto ya no está conectado a Lovable ni se usará. Hoy el favicon es el corazón de Lovable y `vite.config.ts` depende de `@lovable.dev/vite-tanstack-config`.

## Scope
- Reemplazar el preset de Vite de Lovable por una configuración explícita con los plugins que ya son dependencias del proyecto.
- Desinstalar `@lovable.dev/vite-tanstack-config`.
- Borrar `src/lib/lovable-error-reporting.ts` y su uso en `__root.tsx`.
- Generar favicon cuadrado desde `public/4ruedas.png` y enlazarlo en `__root.tsx`.
- Quitar menciones de Lovable en README, AGENTS.md, tasks/README.md, tasks/TASKS.md, CONVENTIONS.md, src/routes/README.md y nav.ts.

## Out of Scope
- No tocar archivos históricos en `tasks/*/done/`.
- No cambiar el diseño visual.

## Expected Files
- vite.config.ts
- package.json
- package-lock.json
- src/routes/__root.tsx
- public/favicon.ico
- public/favicon.png
- README.md
- AGENTS.md
- tasks/README.md
- tasks/TASKS.md
- src/components/erp/CONVENTIONS.md
- src/routes/README.md
- src/components/erp/nav.ts

## Requirements
- No agregar dependencias nuevas.
- Si el build o el dev server fallan tras quitar el preset, revertir `vite.config.ts` y reportar.

## Acceptance Criteria
- [x] `npm run build` y `npm run dev` funcionan sin el preset de Lovable.
- [x] `grep -ri lovable` solo devuelve archivos de `tasks/*/done/`.
- [x] La pestaña muestra el ícono de 4 RUEDAS.

## Verification
- npm run typecheck
- npm run lint
- npm run test
- npm run build

## Completion Report
- Files changed:
  - `vite.config.ts`: configuración explícita (tailwind, tsconfig paths, TanStack Start con entrada `server`, nitro en build, React); mismo alias `@`, dedupe y `lightningcss` que el preset anterior. Sin TanStack devtools (venían solo con el preset).
  - `package.json` / `package-lock.json`: se desinstaló `@lovable.dev/vite-tanstack-config`.
  - `src/lib/lovable-error-reporting.ts`: eliminado. `src/routes/__root.tsx`: sin el reporte a Lovable (se mantiene `console.error` y la pantalla de error) y con los `<link rel="icon">` nuevos.
  - `public/favicon.png` (256×256) y `public/favicon.ico` (16–256): "4" rojo de la marca, generado desde `public/4ruedas.png`.
  - Docs: `README.md` reescrito; `AGENTS.md` sin el aviso de Lovable y con el agente Claude registrado; `tasks/README.md`, `tasks/TASKS.md`, `CONVENTIONS.md`, `src/routes/README.md`, `nav.ts` sin menciones.
- Features completed:
  - El proyecto compila y corre sin dependencias de Lovable. El build usa el target por defecto de nitro (antes: cloudflare-module).
- Tests:
  - `npm run typecheck` OK; `npm run lint` 0 errores (10 warnings preexistentes); `npm run test` 75 archivos / 352 tests OK; `vite build` OK; dev server sirve `/`, `/pos`, `/favicon.png`, `/favicon.ico` con 200.
- Remaining issues:
  - Quedan menciones de Lovable solo en archivos históricos de `tasks/*/done/` y en los títulos históricos C-001 / C-043 del tablero (a propósito).
  - La carpeta `.wrangler/` es un resto del target Cloudflare anterior; no se borró.
  - Favicon no verificado en un navegador real (extensión de Chrome no disponible).
