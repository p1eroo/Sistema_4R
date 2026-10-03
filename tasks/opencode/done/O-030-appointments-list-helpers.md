# O-030 - Helpers de listado de citas

## Agent
OpenCode

## Status
DONE

## Priority
Low

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
O-025, O-003

## Goal
Filtros por fecha, asesor, estado y paginación para la tabla de citas.

## Context
C-020 hará calendario; una tabla simple también necesita helpers.

## Scope
- filterAppointments helper + tests.
- Agrupación por franja horaria.

## Out of Scope
- No UI.
- No cambiar el service salvo exports.

## Expected Files
- src/lib/appointments-query.ts
- src/lib/appointments-query.test.ts

## Requirements
- Puro, reusa ListQuery.
- Timezone local Lima documentada.

## Acceptance Criteria
- [x] Filtrar el día del dashboard devuelve 3 citas.
- [x] Tests pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/lib/appointments-query.ts` (`filterAppointments`, `groupAppointmentsByTimeBlock`, `appointmentTimeBlock`, bloques horarios).
  - `src/lib/appointments-query.test.ts` (nuevo).
  - `src/mocks/appointments/seed.ts` (ajuste: hoy tiene exactamente las 3 citas del dashboard; las extra pasan a mañana).
  - `src/mocks/appointments/service.test.ts` (ajuste de conteos por día).
- Features completed:
  - Filtros puros por fecha (`date`/`fromDate`/`toDate`), asesor, sede, estado y búsqueda, reusando `ListQuery` (paginación/orden por hora).
  - Agrupación por franja (Mañana/Tarde/Noche) en zona horaria `America/Lima`.
- Tests:
  - `appointments-query.test.ts`: 5 tests (3 del día, estado/sede, rango, agrupación, bloque individual).
  - Suite completa: 230/230 pasan.
- Remaining issues:
  - Calendario UI en C-020.
  - `npm run lint` global verde; archivos de O-030 con 0 issues.
