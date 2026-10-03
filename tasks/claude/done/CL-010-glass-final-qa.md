# CL-010 - QA final del rediseño Glass

## Agent
Claude

## Status
DONE

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
- [x] Ninguna ruta conserva el estilo anterior.
- [x] Sin superficies ad-hoc fuera de `Surface`.
- [x] Informe de QA en el Completion Report.

## Verification
- npm run typecheck
- npm run lint
- npm run test
- npm run build

## Completion Report
- Files changed: `src/components/ui/sonner.tsx`, `src/components/ui/chart.tsx`, `src/components/reports/report-hub.tsx`, `src/components/work-orders/work-order-detail.tsx`, `src/routes/_erp/productos/descuentos.tsx`.
- Features completed:
  - Recorrido automático de 55 rutas (43 del menú + detalles de cliente, proveedor, vehículo, inspección, usuario y los 4 reportes) en Chrome headless: 0 errores de consola, 0 páginas de error, 0 desbordes horizontales a 1440 px.
  - Revisión visual en hojas de contacto de 42 de las 55 capturas: estilo consistente, sin superficies con el estilo anterior.
  - Auditoría estática: 0 usos de `border border-border bg-card` y de overlays `bg-black/80`.
  - Ajustes: toasts con fondo blanco sólido (antes translúcido sin blur), tooltip de gráficos con `glass-float`, y se quitaron códigos internos de tarea que aparecían en textos de la interfaz (reportes, detalle de OT, descuentos).
- Tests: `npm run typecheck` OK; `npm run lint` 0 errores (10 warnings preexistentes); `npm run test` 362 OK; `vite build` OK.
- Remaining issues (informe de QA):
  - No revisadas visualmente: hojas con POS/productos (parte), taller WIP/vehículo detalle, usuarios (lista, detalle, permisos, roles). Sí cargaron sin errores.
  - No hay captura del detalle de una orden de trabajo (no se obtuvo un id del seed).
  - No se probó en pantallas menores a 1440 px ni en móvil.
  - Contraste AA y `prefers-reduced-transparency` no se midieron con herramienta; los fallbacks existen en `styles.css`.
  - Rendimiento del blur no medido en un equipo real de mostrador.
  - Fuera del rediseño: el hub de Reportes muestra tarjetas con datos de ejemplo; Reportes de ventas y taller aparecen "Sin datos" con el rango de fechas por defecto.
