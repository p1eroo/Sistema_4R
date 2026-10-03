# O-035 - Tipos y mock de promociones y descuentos

## Agent
OpenCode

## Status
DONE

## Priority
Medium

## Phase
PHASE 4 — Products / Services / Suppliers

## Dependencies
O-031, O-033, O-005

## Goal
Modelar promo % / monto y reglas simples de aplicabilidad.

## Context
El menú tiene Promociones y Descuentos. El Estimate Builder podrá aplicarlas después.

## Scope
- Promotion, Discount types/schemas.
- Helper applyDiscount.
- Seed 2–3.
- Tests del helper.

## Out of Scope
- No motor de pricing complejo.
- No UI (C-026).

## Expected Files
- src/domain/pricing/types.ts
- src/domain/pricing/apply-discount.ts
- src/domain/pricing/apply-discount.test.ts
- src/mocks/pricing/service.ts

## Requirements
- No floats; céntimos.
- No apilar de forma indefinida: documentar regla simple.

## Acceptance Criteria
- [x] applyDiscount testeado.
- [x] Service lista promos activas.
- [x] test/typecheck pasan.

## Verification
- npm run typecheck
- npm run lint (archivos propios)
- npm run test

## Completion Report
- Files changed:
  - `src/domain/pricing/types.ts` (Promotion, Discount, estados, alcance, `isPromotionActive`, `promotionMatchesTarget`).
  - `src/domain/pricing/schemas.ts` (create/update; porcentaje 0-100 / monto fijo en céntimos).
  - `src/domain/pricing/apply-discount.ts` (`calculateDiscountAmount`, `applyDiscount`, `pickBestDiscount`).
  - `src/domain/pricing/apply-discount.test.ts`, `src/domain/pricing/index.ts`.
  - `src/mocks/pricing/seed.ts`, `src/mocks/pricing/service.ts`, `src/mocks/pricing/service.test.ts`.
- Features completed:
  - Promos %/monto fijo con tope opcional, alcance (todo/productos/servicios/categoría) y vigencia.
  - Regla simple documentada: un descuento por línea, sin apilado; `pickBestDiscount` elige el mayor.
  - Service `list`, `listActive`, `getById`, `getByCode`, `create`, `update`, `archive`; código único.
- Tests:
  - `apply-discount.test.ts` (4) + `service.test.ts` (2).
  - Suite completa: 222/222 pasan.
- Remaining issues:
  - Sin UI (C-026) ni integración en Estimate Builder.
  - `npm run lint` global verde; archivos de O-035 con 0 issues.
