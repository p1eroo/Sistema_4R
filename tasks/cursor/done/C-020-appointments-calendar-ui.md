# C-020 - Calendario y UX de Citas

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
C-003, O-025, O-030

## Goal
Agenda diaria/semanal de citas usando el calendario ya instalado.

## Context
`react-day-picker` y `ui/calendar` existen. El dashboard muestra citas de hoy.

## Scope
- Ruta `/taller/citas`.
- Vista día/semana + alta de cita.
- Detalle corto (cliente, vehículo, hora).

## Out of Scope
- No sync Google.
- No crear OT automática (puede CTA a recepción).

## Expected Files
- src/routes/taller/citas/index.tsx
- src/components/appointments/appointment-calendar.tsx

## Requirements
- Usar Calendar existente.
- Las 3 citas del dashboard visibles el 2026-09-25 (o fecha del seed).

## Acceptance Criteria
- [x] Se ven las citas seed.
- [x] Crear cita aparece en el calendario.
- [x] EmptyState si no hay citas en el día.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/taller/citas/index.tsx`
  - `src/components/appointments/appointment-calendar.tsx`
  - `src/components/appointments/appointment-form.tsx`
  - `src/components/appointments/appointment-datetime.ts`
  - `src/components/appointments/appointment-datetime.test.ts`
- Features completed:
  - Vista día/semana con `ui/calendar` y bloques Mañana/Tarde/Noche.
  - Seed de hoy: 09:30 Ana Torres, 11:00 Luis Paredes, 15:30 Rosa Huamán.
  - Alta de cita (cliente/vehículo/sede/hora/duración) y EmptyState en día vacío.
- Tests:
  - ESLint de archivos C-020 OK. Test datetime: semana lun 21–dom 27 sep 2026.
  - Typecheck global falló en `src/mocks/branches/seed.ts` (OpenCode, fuera de alcance).
  - Browser: seed visible; 20-sep EmptyState; cita Lucía Ramos 17:00 aparece.
- Remaining issues:
  - Sin sync Google ni OT automática (CTA a recepción).
  - Typecheck `BranchStatus` es de OpenCode, no de esta tarea.
