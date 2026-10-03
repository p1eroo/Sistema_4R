# O-043 - Tablas simples de stock y movimientos

## Agent
OpenCode

## Status
DONE

## Priority
Medium

## Phase
PHASE 5 — Purchases and Inventory

## Dependencies
O-041, C-003

## Goal
Páginas simples: stock actual, movimientos, stock crítico.

## Context
Cursor hará transferencias/conteo/kardex visual (C-029/C-030). OpenCode cubre las tablas planas.

## Scope
- Rutas `/inventario`, `/inventario/movimientos`, `/inventario/critico`.
- Tabla + search + paginación O-003.

## Out of Scope
- No transferencias UI.
- No kardex visual avanzado.
- No inventario físico.

## Expected Files
- src/routes/inventario/index.tsx
- src/routes/inventario/movimientos.tsx
- src/routes/inventario/critico.tsx

## Requirements
- Pastillas aparecen en crítico.
- Reusar StatusBadge danger/warning.

## Acceptance Criteria
- [x] Stock actual lista balances.
- [x] Crítico muestra 7 ítems.
- [x] lint/typecheck pasan.

## Verification
- npm run lint (exit 0; warnings react-refresh)
- npm run typecheck
- npm run test

## Completion Report
- Files changed:
  - `src/components/inventory/inventory-table.tsx` (tabla genérica + `StockBadge` + labels).
  - `src/routes/_erp/inventario/index.tsx` (stock actual con búsqueda y paginación O-003).
  - `src/routes/_erp/inventario/movimientos.tsx` (movimientos append-only).
  - `src/routes/_erp/inventario/critico.tsx` (stock crítico; 7 ítems; pastillas).
- Features completed:
  - Tablas simples reutilizando `SectionCard`, `StatusBadge`, data-states y `paginate` de O-003.
  - Stock crítico con badges danger/warning y marca de "sin reposición".
- Tests:
  - UI sin lógica pura nueva (datos cubiertos por O-041). Suite completa: 266/266 pasan.
- Remaining issues:
  - **Rutas**: implementadas sobre `src/routes/_erp/inventario/*` (patrón real de C-002/C-003), no `src/routes/inventario/*`.
  - Warnings `react-refresh` por helpers exportados junto al componente; `npm run lint` sigue en exit 0.
