# C-045 - Módulo POS interactivo (Punto de venta, Venta rápida, Cajas, Anticipos)

## Agent
Cursor

## Status
DONE

## Priority
High

## Phase
PHASE 6 — POS and payments (extensión)

## Dependencies
C-031, C-032, C-033, O-044, O-045, O-046

## Goal
Convertir "Punto de venta" en el grupo de menú **POS** con: Punto de venta,
Venta rápida, Listado de cajas y Anticipo clientes (sin anticipo proveedores),
con un POS visual e interactivo con imágenes de productos.

## Scope
- Grupo de navegación POS con 4 rutas bajo `/pos`.
- POS visual: riel de categorías, grilla de productos con imagen, stock,
  stepper de cantidad, panel de orden (cliente, anticipo, líneas, descuento,
  redondeo, métodos de pago), barra de acciones (espera, anular, cobrar, ventas,
  reiniciar, transacciones), proforma e impresión de comprobante.
- Venta rápida orientada a teclado/escáner (F2, F4, F9, ↑↓, Enter).
- Listado de cajas: KPIs, filtros, detalle, movimientos manuales, arqueo y cierre, apertura.
- Anticipo clientes: KPIs, listado, alta (con ingreso a caja si es efectivo),
  detalle con aplicaciones, anulación; aplicable como método de pago en el POS.
- Solo mocks en memoria (sin backend).

## Out of Scope
- Anticipo proveedores.
- Backend / API / persistencia real.

## Acceptance Criteria
- [x] Menú POS con 4 subopciones.
- [x] Catálogo con imágenes y categorías; agregar/quitar con +/−.
- [x] Descuento y redondeo. (Espera/anular quedaron sin UI al retirar la barra de acciones.)
- [x] Cobro con método preseleccionado, billetes rápidos, pago mixto y anticipo.
- [x] Venta registrada en la caja abierta (efectivo neto de vuelto).
- [x] Listado de cajas y anticipos funcionales con mocks.

## Verification
- npm run typecheck
- npm run lint
- npm run test

## Completion Report
- Files changed:
  - Dominio: `src/domain/pos/types.ts` (Advance, OnHold, redondeo), `src/domain/cash/types.ts` (`summarizeCashSession`, `cashFlowTotals`), `src/domain/advances/*` (nuevo).
  - Mocks: `src/mocks/pos/service.ts` (editar líneas, cliente, ajustes, hold/resume/cancel, pago con anticipo), `src/mocks/cash/service.ts` (usa helper de dominio), `src/mocks/advances/*` (nuevo).
  - UI: `src/components/pos/*` (pos-shell, pos-order-panel, pos-product-card, pos-category-rail, pos-checkout, pos-receipt, pos-tickets-sheet, pos-quick-sale, cash-register-list, cash-movements-list, customer-advance-list, use-pos-ticket, use-pos-data, pos-catalog, pos-payment-plan); se eliminó `pos-cart.tsx`.
  - Rutas: `src/routes/_erp/pos/{index,venta-rapida,cajas,anticipos}.tsx`.
  - Shell: `src/components/erp/nav.ts` (grupo POS), `src/components/erp/module-page.tsx` (prop `hideHeader`), `src/styles.css` (impresión de ticket).
  - Assets: `public/pos/*.svg` (ilustraciones de productos y servicios).
  - Ajuste posterior (pedido del usuario): se quitó la barra inferior de acciones (y `pos-tickets-sheet.tsx`) y el límite de altura/scroll de la columna derecha. Los métodos `hold/resume/cancel` del mock siguen disponibles pero sin UI.
- Tests: typecheck OK; lint 0 errores (10 warnings preexistentes en otros módulos); vitest 75 archivos / 352 tests OK (nuevos: advances service, edición de ticket POS, helpers de cobro).
- Remaining issues: QA visual en navegador pendiente (extensión de Chrome no disponible en la sesión); verificado por SSR que las 4 rutas renderizan.
