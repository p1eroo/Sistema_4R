# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `_erp.tsx` | pathless ERP layout — wraps module pages in `AppShell` via `<Outlet />` |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.

The navigation contract (label → path → file) lives in
`src/components/erp/nav.ts`. Keep the sidebar and this table in sync with that
file.

## Layout decision (C-002)

- `/` (Dashboard) stays in `src/routes/index.tsx` and keeps wrapping `AppShell`
  itself so the Lovable dashboard is not moved or redesigned.
- Every other module route is a child of the pathless layout `src/routes/_erp.tsx`.
  That layout mounts `AppShell` once. Stubs only render page content.

## Module map

| Módulo | Path | Archivo |
| --- | --- | --- |
| Dashboard | `/` | `src/routes/index.tsx` |
| Recepción de vehículo | `/taller/recepcion` | `src/routes/_erp/taller/recepcion/index.tsx` |
| Órdenes de trabajo | `/taller/ordenes` | `src/routes/_erp/taller/ordenes/index.tsx` |
| Vehículos | `/taller/vehiculos` | `src/routes/_erp/taller/vehiculos/index.tsx` |
| Citas | `/taller/citas` | `src/routes/_erp/taller/citas/index.tsx` |
| Inspecciones | `/taller/inspecciones` | `src/routes/_erp/taller/inspecciones/index.tsx` |
| Diagnósticos | `/taller/diagnosticos` | `src/routes/_erp/taller/diagnosticos/index.tsx` |
| Presupuestos | `/taller/presupuestos` | `src/routes/_erp/taller/presupuestos/index.tsx` |
| Trabajos en proceso | `/taller/wip` | `src/routes/_erp/taller/wip/index.tsx` |
| Bahías del taller | `/taller/bahias` | `src/routes/_erp/taller/bahias/index.tsx` |
| Control de calidad | `/taller/calidad` | `src/routes/_erp/taller/calidad/index.tsx` |
| Entregas | `/taller/entregas` | `src/routes/_erp/taller/entregas/index.tsx` |
| Historial de vehículos | `/taller/historial` | `src/routes/_erp/taller/historial/index.tsx` |
| Punto de venta | `/pos` | `src/routes/_erp/pos/index.tsx` |
| Productos | `/productos` | `src/routes/_erp/productos/index.tsx` |
| Servicios | `/productos/servicios` | `src/routes/_erp/productos/servicios.tsx` |
| Categorías | `/productos/categorias` | `src/routes/_erp/productos/categorias.tsx` |
| Marcas | `/productos/marcas` | `src/routes/_erp/productos/marcas.tsx` |
| Líneas | `/productos/lineas` | `src/routes/_erp/productos/lineas.tsx` |
| Promociones | `/productos/promociones` | `src/routes/_erp/productos/promociones.tsx` |
| Descuentos | `/productos/descuentos` | `src/routes/_erp/productos/descuentos.tsx` |
| Clientes | `/clientes` | `src/routes/_erp/clientes/index.tsx` |
| Proveedores | `/proveedores` | `src/routes/_erp/proveedores/index.tsx` |
| Nueva compra | `/compras/nueva` | `src/routes/_erp/compras/nueva.tsx` |
| Lista de compras | `/compras` | `src/routes/_erp/compras/index.tsx` |
| Órdenes de compra | `/compras/ordenes` | `src/routes/_erp/compras/ordenes.tsx` |
| Cotizaciones | `/compras/cotizaciones` | `src/routes/_erp/compras/cotizaciones.tsx` |
| Gastos diversos | `/compras/gastos` | `src/routes/_erp/compras/gastos.tsx` |
| Stock actual | `/inventario` | `src/routes/_erp/inventario/index.tsx` |
| Movimientos | `/inventario/movimientos` | `src/routes/_erp/inventario/movimientos.tsx` |
| Transferencias | `/inventario/transferencias` | `src/routes/_erp/inventario/transferencias.tsx` |
| Devoluciones | `/inventario/devoluciones` | `src/routes/_erp/inventario/devoluciones.tsx` |
| Ajustes | `/inventario/ajustes` | `src/routes/_erp/inventario/ajustes.tsx` |
| Kardex | `/inventario/kardex` | `src/routes/_erp/inventario/kardex.tsx` |
| Stock histórico | `/inventario/historico` | `src/routes/_erp/inventario/historico.tsx` |
| Inventario físico | `/inventario/fisico` | `src/routes/_erp/inventario/fisico.tsx` |
| Stock crítico | `/inventario/critico` | `src/routes/_erp/inventario/critico.tsx` |
| Usuarios | `/usuarios` | `src/routes/_erp/usuarios/index.tsx` |
| Roles | `/usuarios/roles` | `src/routes/_erp/usuarios/roles.tsx` |
| Permisos | `/usuarios/permisos` | `src/routes/_erp/usuarios/permisos.tsx` |
| Sedes | `/usuarios/sedes` | `src/routes/_erp/usuarios/sedes.tsx` |
| Reportes | `/reportes` | `src/routes/_erp/reportes/index.tsx` |
| Configuración | `/configuracion` | `src/routes/_erp/configuracion/index.tsx` |
