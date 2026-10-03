# C-026 - UX de Promociones y descuentos

## Agent
Cursor

## Status
DONE

## Priority
Medium

## Phase
PHASE 4 — Products / Services / Suppliers

## Dependencies
C-024, C-025, O-035

## Goal
Pantallas para crear y activar promos/descuentos y previsualizar el precio resultante.

## Context
Más UX que un CRUD: vigencia, alcance (producto/servicio) y preview.

## Scope
- Rutas `/productos/promociones` y `/productos/descuentos`.
- Formulario de vigencia y alcance.
- Preview usando applyDiscount.

## Out of Scope
- No motor de pricing extra.
- No aplicar promo dentro de POS (Phase 6).

## Expected Files
- src/routes/productos/promociones.tsx
- src/routes/productos/descuentos.tsx
- src/components/pricing/promo-editor.tsx

## Requirements
- Preview en S/.
- No recalcular en el cliente distinto al helper O-035.

## Acceptance Criteria
- [x] Se crea una promo % y el preview coincide con el helper.
- [x] Lista de activas/inactivas.

## Verification
- npm run lint
- npx tsc --noEmit (o `npm run typecheck` cuando exista el script de O-001)
- Tests unitarios si la tarea introduce lógica o helpers

## Completion Report
- Files changed:
  - `src/routes/_erp/productos/promociones.tsx`
  - `src/routes/_erp/productos/descuentos.tsx`
  - `src/components/pricing/promo-editor.tsx`
  - `src/components/pricing/promo-list.tsx`
  - `src/components/pricing/promo-preview.ts`
  - `src/components/pricing/promo-preview.test.ts`
- Features completed:
  - Lista seed (MANT-10, FRENOS-20 activas; ACEITE-5 inactiva) con filtro de estado.
  - Editor con vigencia, alcance y preview `applyDiscount` (15% de S/ 180.00 = S/ 153.00).
  - Alta VERANO-15 aparece como Activa.
- Tests:
  - `promo-preview.test.ts` delega en `applyDiscount`.
  - ESLint de archivos C-026 OK.
  - Browser: filtros + create + página Descuentos.
- Remaining issues:
  - No se aplica la promo en POS (Phase 6).
