import {
  BarChart3,
  Boxes,
  Building2,
  Gauge,
  Monitor,
  PackageSearch,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type AppPath = (typeof ALL_NAV_PATHS)[number];

export type NavLeaf = {
  label: string;
  path: AppPath;
  file: string;
};

export type NavGroup = {
  label: string;
  icon: LucideIcon;
  path?: AppPath;
  file?: string;
  children?: NavLeaf[];
};

/**
 * Contrato de navegación del prototipo.
 * Paths en español, alineados al menú lateral.
 * `file` es la ruta file-based bajo `src/routes/` (no editar routeTree.gen.ts).
 * Dashboard permanece en `index.tsx` (fuera de `_erp`) para no alterar su UI.
 * El resto de módulos cuelga del layout pathless `_erp.tsx` que monta AppShell.
 */
export const navGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: Gauge,
    path: "/",
    file: "src/routes/index.tsx",
  },
  {
    label: "Taller",
    icon: Wrench,
    children: [
      {
        label: "Recepción de vehículo",
        path: "/taller/recepcion",
        file: "src/routes/_erp/taller/recepcion/index.tsx",
      },
      {
        label: "Órdenes de trabajo",
        path: "/taller/ordenes",
        file: "src/routes/_erp/taller/ordenes/index.tsx",
      },
      {
        label: "Vehículos",
        path: "/taller/vehiculos",
        file: "src/routes/_erp/taller/vehiculos/index.tsx",
      },
      {
        label: "Citas",
        path: "/taller/citas",
        file: "src/routes/_erp/taller/citas/index.tsx",
      },
      {
        label: "Inspecciones",
        path: "/taller/inspecciones",
        file: "src/routes/_erp/taller/inspecciones/index.tsx",
      },
      {
        label: "Diagnósticos",
        path: "/taller/diagnosticos",
        file: "src/routes/_erp/taller/diagnosticos/index.tsx",
      },
      {
        label: "Presupuestos",
        path: "/taller/presupuestos",
        file: "src/routes/_erp/taller/presupuestos/index.tsx",
      },
      {
        label: "Trabajos en proceso",
        path: "/taller/wip",
        file: "src/routes/_erp/taller/wip/index.tsx",
      },
      {
        label: "Bahías del taller",
        path: "/taller/bahias",
        file: "src/routes/_erp/taller/bahias/index.tsx",
      },
      {
        label: "Control de calidad",
        path: "/taller/calidad",
        file: "src/routes/_erp/taller/calidad/index.tsx",
      },
      {
        label: "Entregas",
        path: "/taller/entregas",
        file: "src/routes/_erp/taller/entregas/index.tsx",
      },
      {
        label: "Historial de vehículos",
        path: "/taller/historial",
        file: "src/routes/_erp/taller/historial/index.tsx",
      },
    ],
  },
  {
    label: "POS",
    icon: Monitor,
    children: [
      {
        label: "Punto de venta",
        path: "/pos",
        file: "src/routes/_erp/pos/index.tsx",
      },
      {
        label: "Venta rápida",
        path: "/pos/venta-rapida",
        file: "src/routes/_erp/pos/venta-rapida.tsx",
      },
      {
        label: "Listado de cajas",
        path: "/pos/cajas",
        file: "src/routes/_erp/pos/cajas.tsx",
      },
      {
        label: "Anticipo clientes",
        path: "/pos/anticipos",
        file: "src/routes/_erp/pos/anticipos.tsx",
      },
    ],
  },
  {
    label: "Productos y servicios",
    icon: PackageSearch,
    children: [
      {
        label: "Productos",
        path: "/productos",
        file: "src/routes/_erp/productos/index.tsx",
      },
      {
        label: "Servicios",
        path: "/productos/servicios",
        file: "src/routes/_erp/productos/servicios.tsx",
      },
      {
        label: "Categorías",
        path: "/productos/categorias",
        file: "src/routes/_erp/productos/categorias.tsx",
      },
      {
        label: "Marcas",
        path: "/productos/marcas",
        file: "src/routes/_erp/productos/marcas.tsx",
      },
      {
        label: "Líneas",
        path: "/productos/lineas",
        file: "src/routes/_erp/productos/lineas.tsx",
      },
      {
        label: "Promociones",
        path: "/productos/promociones",
        file: "src/routes/_erp/productos/promociones.tsx",
      },
      {
        label: "Descuentos",
        path: "/productos/descuentos",
        file: "src/routes/_erp/productos/descuentos.tsx",
      },
    ],
  },
  {
    label: "Clientes",
    icon: Users,
    path: "/clientes",
    file: "src/routes/_erp/clientes/index.tsx",
  },
  {
    label: "Proveedores",
    icon: Truck,
    path: "/proveedores",
    file: "src/routes/_erp/proveedores/index.tsx",
  },
  {
    label: "Compras",
    icon: ShoppingCart,
    children: [
      {
        label: "Nueva compra",
        path: "/compras/nueva",
        file: "src/routes/_erp/compras/nueva.tsx",
      },
      {
        label: "Lista de compras",
        path: "/compras",
        file: "src/routes/_erp/compras/index.tsx",
      },
      {
        label: "Órdenes de compra",
        path: "/compras/ordenes",
        file: "src/routes/_erp/compras/ordenes.tsx",
      },
      {
        label: "Cotizaciones",
        path: "/compras/cotizaciones",
        file: "src/routes/_erp/compras/cotizaciones.tsx",
      },
      {
        label: "Gastos diversos",
        path: "/compras/gastos",
        file: "src/routes/_erp/compras/gastos.tsx",
      },
    ],
  },
  {
    label: "Inventario",
    icon: Boxes,
    children: [
      {
        label: "Stock actual",
        path: "/inventario",
        file: "src/routes/_erp/inventario/index.tsx",
      },
      {
        label: "Movimientos",
        path: "/inventario/movimientos",
        file: "src/routes/_erp/inventario/movimientos.tsx",
      },
      {
        label: "Transferencias",
        path: "/inventario/transferencias",
        file: "src/routes/_erp/inventario/transferencias.tsx",
      },
      {
        label: "Devoluciones",
        path: "/inventario/devoluciones",
        file: "src/routes/_erp/inventario/devoluciones.tsx",
      },
      {
        label: "Ajustes",
        path: "/inventario/ajustes",
        file: "src/routes/_erp/inventario/ajustes.tsx",
      },
      {
        label: "Kardex",
        path: "/inventario/kardex",
        file: "src/routes/_erp/inventario/kardex.tsx",
      },
      {
        label: "Stock histórico",
        path: "/inventario/historico",
        file: "src/routes/_erp/inventario/historico.tsx",
      },
      {
        label: "Inventario físico",
        path: "/inventario/fisico",
        file: "src/routes/_erp/inventario/fisico.tsx",
      },
      {
        label: "Stock crítico",
        path: "/inventario/critico",
        file: "src/routes/_erp/inventario/critico.tsx",
      },
    ],
  },
  {
    label: "Usuarios y sedes",
    icon: Building2,
    children: [
      {
        label: "Usuarios",
        path: "/usuarios",
        file: "src/routes/_erp/usuarios/index.tsx",
      },
      {
        label: "Roles",
        path: "/usuarios/roles",
        file: "src/routes/_erp/usuarios/roles.tsx",
      },
      {
        label: "Permisos",
        path: "/usuarios/permisos",
        file: "src/routes/_erp/usuarios/permisos.tsx",
      },
      {
        label: "Sedes",
        path: "/usuarios/sedes",
        file: "src/routes/_erp/usuarios/sedes.tsx",
      },
    ],
  },
  {
    label: "Reportes",
    icon: BarChart3,
    path: "/reportes",
    file: "src/routes/_erp/reportes/index.tsx",
  },
  {
    label: "Configuración",
    icon: Settings,
    path: "/configuracion",
    file: "src/routes/_erp/configuracion/index.tsx",
  },
];

export const ALL_NAV_PATHS = [
  "/",
  "/taller/recepcion",
  "/taller/ordenes",
  "/taller/vehiculos",
  "/taller/citas",
  "/taller/inspecciones",
  "/taller/diagnosticos",
  "/taller/presupuestos",
  "/taller/wip",
  "/taller/bahias",
  "/taller/calidad",
  "/taller/entregas",
  "/taller/historial",
  "/pos",
  "/pos/venta-rapida",
  "/pos/cajas",
  "/pos/anticipos",
  "/productos",
  "/productos/servicios",
  "/productos/categorias",
  "/productos/marcas",
  "/productos/lineas",
  "/productos/promociones",
  "/productos/descuentos",
  "/clientes",
  "/proveedores",
  "/compras/nueva",
  "/compras",
  "/compras/ordenes",
  "/compras/cotizaciones",
  "/compras/gastos",
  "/inventario",
  "/inventario/movimientos",
  "/inventario/transferencias",
  "/inventario/devoluciones",
  "/inventario/ajustes",
  "/inventario/kardex",
  "/inventario/historico",
  "/inventario/fisico",
  "/inventario/critico",
  "/usuarios",
  "/usuarios/roles",
  "/usuarios/permisos",
  "/usuarios/sedes",
  "/reportes",
  "/configuracion",
] as const;

/** Rutas raíz cuyos detalles hijos deben mantener el ítem del menú activo. */
const NAV_SECTION_ROOTS = new Set<AppPath>([
  "/clientes",
  "/proveedores",
  "/reportes",
  "/usuarios",
  "/taller/ordenes",
  "/taller/vehiculos",
  "/taller/inspecciones",
]);

const REPORT_VIEW_LABELS: Record<string, string> = {
  ventas: "Ventas",
  taller: "Taller",
  inventario: "Inventario",
  cobranzas: "Cobranzas",
};

const DETAIL_CHROME: {
  pattern: RegExp;
  group: string;
  title: string;
}[] = [
  { pattern: /^\/clientes\/[^/]+$/, group: "Clientes", title: "Detalle" },
  { pattern: /^\/proveedores\/[^/]+$/, group: "Proveedores", title: "Detalle" },
  {
    pattern: /^\/taller\/vehiculos\/[^/]+$/,
    group: "Taller",
    title: "Detalle de vehículo",
  },
  {
    pattern: /^\/taller\/ordenes\/[^/]+$/,
    group: "Taller",
    title: "Detalle de orden",
  },
  {
    pattern: /^\/taller\/inspecciones\/[^/]+$/,
    group: "Taller",
    title: "Detalle de inspección",
  },
  {
    pattern: /^\/usuarios\/[^/]+$/,
    group: "Usuarios y sedes",
    title: "Detalle de usuario",
  },
];

export function normalizeNavPath(pathname: string): string {
  if (pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function isNavPathActive(pathname: string, path: AppPath): boolean {
  const current = normalizeNavPath(pathname);
  const target = normalizeNavPath(path);

  if (current === target) {
    return true;
  }

  if (path === "/" || !NAV_SECTION_ROOTS.has(path)) {
    return false;
  }

  return current.startsWith(`${target}/`);
}

export function chromeFromPath(pathname: string): {
  title: string;
  breadcrumb: string;
} {
  const current = normalizeNavPath(pathname);

  const reportMatch = current.match(/^\/reportes\/([^/]+)$/);
  if (reportMatch) {
    const segment = reportMatch[1] ?? "";
    const title = REPORT_VIEW_LABELS[segment] ?? segment;
    return {
      title,
      breadcrumb: `Inicio / Reportes / ${title}`,
    };
  }

  for (const rule of DETAIL_CHROME) {
    if (rule.pattern.test(current)) {
      return {
        title: rule.title,
        breadcrumb: `Inicio / ${rule.group} / ${rule.title}`,
      };
    }
  }

  for (const group of navGroups) {
    if (group.path && normalizeNavPath(group.path) === current) {
      return {
        title: group.label,
        breadcrumb: `Inicio / ${group.label}`,
      };
    }

    const child = group.children?.find(
      (item) => normalizeNavPath(item.path) === current,
    );

    if (child) {
      return {
        title: child.label,
        breadcrumb: `Inicio / ${group.label} / ${child.label}`,
      };
    }
  }

  return { title: "4 RUEDAS", breadcrumb: "Inicio" };
}

export function navLeaves(): NavLeaf[] {
  return navGroups.flatMap((group) => {
    if (group.children) {
      return group.children;
    }

    if (group.path && group.file) {
      return [{ label: group.label, path: group.path, file: group.file }];
    }

    return [];
  });
}
