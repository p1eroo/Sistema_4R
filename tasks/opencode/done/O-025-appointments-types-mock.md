# O-025 - Tipos y mock de Appointments

## Agent
OpenCode

## Status
DONE

## Priority
High

## Phase
PHASE 3 — Work Orders and Workshop

## Dependencies
O-007, O-011, O-005

## Goal
Modelar y sembrar citas del taller, incluyendo las 3 del dashboard.

## Context
Dashboard: 09:30 Ana Torres Toyota Yaris; 11:00 Luis Paredes Nissan Versa; 15:30 Rosa Huamán Suzuki Swift.

## Scope
- Appointment types + statuses.
- Schemas mínimos.
- Seed del día + service list/create/update/cancel.
- Tests.

## Out of Scope
- No calendario UI (C-020).
- No OT automática.

## Expected Files
- src/domain/appointments/types.ts
- src/domain/appointments/schemas.ts
- src/mocks/appointments/seed.ts
- src/mocks/appointments/service.ts
- src/mocks/appointments/service.test.ts

## Requirements
- Las 3 citas del dashboard existen con esos horarios.
- Date/time ISO.

## Acceptance Criteria
- [x] listByDate(hoy) devuelve esas citas.
- [x] Tests pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/appointments/types.ts` (Appointment, estados, tipos de servicio, helpers de fecha Lima).
  - `src/domain/appointments/schemas.ts` (create/update).
  - `src/domain/appointments/index.ts` (barrel).
  - `src/mocks/appointments/seed.ts` (6 citas; incluye las 3 del dashboard).
  - `src/mocks/appointments/service.ts` (`list`, `listByDate`, `getById`, `create`, `update`, `cancel`).
  - `src/mocks/appointments/service.test.ts` (nuevo).
- Features completed:
  - Citas con horario ISO en `America/Lima`; helpers `appointmentDateKey`, `todayDateKey`, `limaDateTimeIso`.
  - Seed del día: 09:30 Ana Torres/Yaris, 11:00 Luis Paredes/Versa, 15:30 Rosa Huamán/Swift (+2 del día, +1 mañana).
  - `listByDate` acepta `Date` o clave `YYYY-MM-DD`; `create`/`update`/`cancel` con errores tipados.
- Tests:
  - `src/mocks/appointments/service.test.ts`: 6 tests (3 del dashboard, separación por día, create+id, payload inválido, update, cancel, not found).
  - Suite completa: 154/154 pasan.
- Remaining issues:
  - Filtros/agrupación fina van en O-030 (`src/lib/appointments-query.ts`).
  - `npm run lint` global verde; archivos de O-025 con 0 issues.
