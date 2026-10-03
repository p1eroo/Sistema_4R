# 4 RUEDAS FRONTEND TASK BOARD

Prototipo frontend-only para **4 RUEDAS Mecánica Automotriz**.
Fuente visual de verdad: `src/components/erp/CONVENTIONS.md` (`AppShell`, sidebar, header, tokens, dashboard en `/`).
En curso: **PHASE 11 — Rediseño Glass** (solo CSS, tema claro), a cargo de Claude y OpenCode.

## Current Phase

**PHASE 11 — Rediseño Glass** (PHASE 0–10 completas)

## Claude

### TODO
- [ ] CL-010 QA final del rediseño Glass

### DOING

### DONE
- [x] CL-001 Quitar Lovable y poner favicon de 4 RUEDAS
- [x] CL-002 Dirección visual y reglas del rediseño Glass (variante vigente: Glass suave + vidrio medio en capas flotantes y shell)
- [x] CL-003 Tokens y utilidades glass + fondo de degradados
- [x] CL-004 Shell glass: sidebar, header y page header
- [x] CL-005 Primitivos de referencia en glass
- [x] CL-006 Dashboard en glass
- [x] CL-007 POS en glass (4 pantallas)
- [x] CL-008 Taller A en glass
- [x] CL-009 Taller B en glass
- [x] CL-011 Capas flotantes en vidrio medio y menús con tipografía de ERP

## Cursor

### TODO

### DOING

### DONE
- [x] C-001 Auditoría del design system Lovable
- [x] C-002 Arquitectura de rutas y contrato de navegación
- [x] C-003 Chrome compartido de páginas ERP
- [x] C-004 UI listado de Clientes
- [x] C-005 UI detalle de Cliente
- [x] C-006 UI listado de Vehículos
- [x] C-007 UI detalle de Vehículo
- [x] C-008 Shell del wizard de Recepción
- [x] C-009 Paso Cliente y Vehículo de Recepción
- [x] C-010 UI de mapa de daños
- [x] C-011 Checklist y notas de Recepción
- [x] C-012 Revisión final de Recepción y handoff a OT
- [x] C-013 UI listado de Órdenes de trabajo
- [x] C-014 UI detalle de Orden de trabajo
- [x] C-015 Estimate Builder
- [x] C-016 Tablero WIP / Kanban
- [x] C-017 UI de Bahías del taller
- [x] C-018 UI de Inspecciones
- [x] C-019 UI de Diagnósticos
- [x] C-020 Calendario y UX de Citas
- [x] C-021 Flujo de Control de calidad
- [x] C-022 Flujo de Entregas
- [x] C-023 Historial de vehículos
- [x] C-024 UI catálogo de Productos
- [x] C-025 UI catálogo de Servicios
- [x] C-026 UX de Promociones y descuentos
- [x] C-027 UI de Proveedores
- [x] C-028 Workflow de nueva compra y OC
- [x] C-029 Transferencias, devoluciones, ajustes y conteo físico
- [x] C-030 Kardex y stock histórico
- [x] C-031 Shell POS y carrito
- [x] C-032 Checkout y pagos POS
- [x] C-033 UX de sesión de caja
- [x] C-034 Conectar Dashboard a mocks (sin rediseñar)
- [x] C-035 Filtros y deep links del Dashboard
- [x] C-036 Hub de Reportes
- [x] C-037 Vistas de reportes operativos
- [x] C-038 UX de usuarios y permisos
- [x] C-039 UI de Configuración
- [x] C-040 Wiring de header: sede, búsqueda, notificaciones y perfil
- [x] C-041 Pase final de navegación y breadcrumbs
- [x] C-042 Integración del flujo punta a punta
- [x] C-043 QA visual contra Lovable
- [x] C-044 Revisión final de integración
- [x] C-045 Módulo POS interactivo (Punto de venta, Venta rápida, Cajas, Anticipos)

## OpenCode

### TODO
- [ ] O-060 Usuarios, sedes y configuración en glass
- [ ] O-061 Reportes en glass
- [ ] O-062 Tests de primitivos y guardia de superficies ad-hoc

### DOING

### DONE
- [x] O-001 Toolchain de typecheck y tests
- [x] O-002 Primitivos de dominio compartidos
- [x] O-003 Tipos de lista, filtro y paginación
- [x] O-005 Kit de repositorio mock en memoria
- [x] O-004 Schemas Zod compartidos
- [x] O-006 Componentes de loading, empty y error
- [x] O-007 Tipos de dominio Customer
- [x] O-011 Tipos de dominio Vehicle
- [x] O-008 Schemas Zod de Customer
- [x] O-009 Seed data de Customer
- [x] O-010 Mock service de Customer
- [x] O-012 Schemas Zod de Vehicle
- [x] O-013 Seed data de Vehicle
- [x] O-014 Mock service de Vehicle
- [x] O-015 Formulario simple de Customer
- [x] O-016 Formulario simple de Vehicle
- [x] O-017 Tipos de dominio Reception
- [x] O-018 Schemas Zod de Reception
- [x] O-019 Mock service de Reception
- [x] O-020 Tipos de inspección y mapa de daños
- [x] O-021 Mock service de Inspection
- [x] O-022 Tipos de dominio Work Order
- [x] O-023 Schemas Zod de Work Order
- [x] O-024 Mock service de Work Order
- [x] O-025 Tipos y mock de Appointments
- [x] O-028 Tipos WIP, bahías, QC y entregas
- [x] O-027 Tipos y mock de Estimates
- [x] O-029 Mock services de operación de taller
- [x] O-031 Tipos y schemas de Product
- [x] O-033 Tipos y mock de Servicios
- [x] O-032 Mock de Product
- [x] O-036 Tipos y mock de Suppliers
- [x] O-026 Tipos y mock de Diagnostics
- [x] O-034 Taxonomía: categorías, marcas y líneas
- [x] O-035 Tipos y mock de promociones y descuentos
- [x] O-030 Helpers de listado de citas
- [x] O-040 Tipos y schemas de Inventory
- [x] O-041 Mock de Inventory
- [x] O-038 Tipos y schemas de Purchases
- [x] O-039 Mock de Purchases
- [x] O-042 Listados simples de Compras
- [x] O-044 Tipos de POS, carrito y pagos
- [x] O-045 Mock service de POS
- [x] O-047 Mock de agregación del Dashboard
- [x] O-046 Tipos y mock de caja / turno
- [x] O-043 Tablas simples de stock y movimientos
- [x] O-049 Tipos y mock de usuarios, roles y permisos
- [x] O-050 Tipos y mock de Sedes
- [x] O-053 Integridad de seeds cross-módulo
- [x] O-048 Datasets y helpers de Reportes
- [x] O-051 Tipos y mock de Settings
- [x] O-052 Forms y tablas simples de identidad y sedes
- [x] O-037 CRUD simple de taxonomía
- [x] O-054 Tests unitarios de helpers y mocks críticos
- [x] O-055 Resto de primitivos shadcn en glass (sin capas flotantes: hechas en CL-011)
- [x] O-056 Clientes y Proveedores en glass
- [x] O-057 Productos, servicios, catálogo y precios en glass
- [x] O-058 Compras en glass
- [x] O-059 Inventario en glass

## Blocked

## Dependencies / Notes

- El producto es **frontend only**. No hay backend. Todos los datos viven en `src/mocks`.
- Ya existe y **no se reimplementa**: `AppShell`, `AppSidebar`, `AppHeader`, tokens en `src/styles.css`, primitivos shadcn, `MetricCard` / `SectionCard` / `StatusBadge`, y el layout visual del dashboard en `src/routes/index.tsx`.
- Las rutas de módulo bajo `_erp` son pantallas reales (mocks). Sidebar + breadcrumbs alineados en C-041. AppHeader dinámico (C-040).
- Ya existen primitivos en `src/domain/shared`, data-states, scripts `typecheck` / `test` (O-001–O-006), mocks y forms de Customer/Vehicle (O-007–O-016).
- Bahías del taller no estaba en el menú original; C-002 la añadió al mapa porque forma parte del alcance.
- **No dos agentes sobre el mismo archivo a la vez.** Ownership típico:
  - Cursor: `src/routes/**`, `src/components/erp/app-*.tsx`, `page-header`, wizards, kanban, POS, damage map, dashboard.
  - OpenCode: `src/domain/**`, `src/mocks/**`, schemas, forms simples, data-states, tablas simples, tests.
- C-012 depende de O-024 (crear OT). El wizard de recepción puede avanzar en paralelo hasta el review.
- C-034 es el único dueño de `src/routes/index.tsx` en Phase 7. Nadie más lo reescribe.
- C-002 toca el sidebar en Phase 0; C-033 solo el footer de caja; C-041 el pase final de nav. No solapar esas ventanas.
- Preferir IDs y nombres canónicos del dashboard: `OT-2026-0184`, `ABC-123`, `B4X-521`, `F001-00982`, Lucía Ramos, Carlos Mendoza, Sede La Molina.

- **PHASE 11 (Rediseño Glass)**: OpenCode no empieza O-055…O-062 hasta que **CL-005** esté en DONE.
  Durante el rollout nadie edita `src/styles.css`, `src/components/erp/*` ni `src/components/ui/*` salvo su dueño
  (CL-003 / CL-004 / CL-005 / O-055). Si un módulo necesita un token nuevo, la tarea se bloquea y se pide a Claude.
  Solo CSS: no se agregan dependencias (se descartaron `shadergradient` y `liquid-glass-js` por peso).

### Recommended first tasks

- Claude: CL-006 → CL-007 → CL-008 → CL-009, luego CL-010.
- OpenCode: **desbloqueado** (CL-005 DONE). Siguen O-060 … O-062; leer antes `src/components/erp/CONVENTIONS.md` §0.
- Cursor: sin tareas nuevas (C-001–C-045 DONE).

## Phase Progress

| Phase | Name | Cursor | OpenCode | Status |
| --- | --- | --- | --- | --- |
| 0 | Foundation / current code audit | C-001 – C-003 | O-001 – O-006 | Done |
| 1 | Customers and Vehicles | C-004 – C-007 | O-007 – O-016 | Done |
| 2 | Vehicle Reception | C-008 – C-012 | O-017 – O-021 | Done |
| 3 | Work Orders and Workshop operations | C-013 – C-023 | O-022 – O-030 | Done |
| 4 | Products / Services / Suppliers | C-024 – C-027 | O-031 – O-037 | Done |
| 5 | Purchases and Inventory | C-028 – C-030 | O-038 – O-043 | Done |
| 6 | POS and payments frontend | C-031 – C-033 | O-044 – O-046 | Done |
| 7 | Dashboard | C-034 – C-035 | O-047 | Done |
| 8 | Reports | C-036 – C-037 | O-048 | Done |
| 9 | Users / Branches / Settings | C-038 – C-040 | O-049 – O-052 | Done |
| 10 | Frontend integration and QA | C-041 – C-045 | O-053 – O-054 | Done |
| 11 | Rediseño Glass | Claude: CL-001 – CL-010 | O-055 – O-062 | In progress |

Counts: **45 Cursor** · **62 OpenCode** · **11 Claude** · **118 total** · **0 blocked** · **0 doing** · **110 done**
