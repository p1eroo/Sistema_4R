# 4 RUEDAS — convenciones visuales y de implementación

Esta guía es la fuente de verdad para cualquier módulo nuevo.
**No se rediseña el producto.** El dashboard Lovable en `src/routes/index.tsx` define el lenguaje visual. Los tokens, el shell y los primitivos ERP existentes se reutilizan tal cual.

Si una pantalla nueva no se siente como el dashboard, está mal: falta reusar, no falta inventar otra estética.

---

## 1. Qué ya existe y se reutiliza tal cual

### Shell ERP (obligatorio en todo módulo)

| Pieza | Archivo | Uso |
| --- | --- | --- |
| `AppShell` | `src/components/erp/app-shell.tsx` | Envuelve **todas** las páginas autenticadas. Sidebar 16rem / icon 4.5rem. |
| `AppSidebar` | `src/components/erp/app-sidebar.tsx` | Navegación. No duplicar menús laterales. |
| `AppHeader` | `src/components/erp/app-header.tsx` | Header sticky `h-16`, `bg-card`, breadcrumb + título + acciones. |

No crear layouts paralelos, top-nav alternativas ni páginas fuera de `AppShell`.

### Primitivos ERP

| Pieza | Archivo | Uso |
| --- | --- | --- |
| `MetricCard` | `dashboard-ui.tsx` | KPI: label `text-xs`, valor `text-lg font-bold tabular-nums`, ícono `size-9`, énfasis `default \| warning \| danger`. Card `shadow-xs`. |
| `SectionCard` | `dashboard-ui.tsx` | Bloque de contenido: título `text-sm font-bold`, subtítulo `text-[11px] text-muted-foreground`, header con `border-b`, body `p-4`. |
| `StatusBadge` | `dashboard-ui.tsx` | Estado operativo: `info \| success \| warning \| danger \| neutral`. `text-[10px] font-bold`, `rounded-md px-2 py-1`. |

Para estados de negocio (OT, stock, citas) usar `StatusBadge`, no `Badge` de shadcn.

### Primitivos UI (shadcn / Radix, New York)

Viven en `src/components/ui/`. **No crear equivalentes.**

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toggle`, `toggle-group`, `tooltip`.

Iconos: solo `lucide-react`. Charts: solo `recharts` + `ChartContainer`.

---

## 2. Tokens semánticos

Definidos en `src/styles.css` (`:root` + `@theme inline`). Colores en **oklch**. No añadir paletas hex/rgb ni nuevas familias de color.

### Color (light — tema de producto)

| Token | Uso en el ERP |
| --- | --- |
| `primary` / `primary-foreground` | Azul de marca. Acciones default, chips de placa, íconos de métrica, marca 4R. |
| `background` / `foreground` | Lienzo de módulo (`bg-background`) y texto. |
| `card` / `card-foreground` | Superficies, header, filtros. |
| `muted` / `muted-foreground` | Fondos suaves, labels, breadcrumbs, detalles. |
| `secondary` / `secondary-foreground` | Botón aplicado / secundario. |
| `accent` / `accent-foreground` | Hover de ghost/outline. |
| `border` / `input` / `ring` | Bordes, inputs, focus. |
| `destructive` / `destructive-foreground` | Peligro, trend down, badge danger, punto de notificación. |
| `success` | Trend up (`text-success`), badge success. |
| `warning` / `warning-foreground` | Atención (presupuestos, CxC). Badge warning usa `bg-warning/12 text-warning-foreground`. |
| `info` | Badge informativo. |
| `critical` / `critical-foreground` | CTA de operación urgente (ej. «Nueva orden»). **No es lo mismo que `destructive`.** |
| `chart-1` … `chart-5` | Series. En dashboard: diagnosis / reparación / control / listo. |
| `sidebar-*` | Solo el menú lateral. |

Utilidades Tailwind ya mapeadas: `bg-primary`, `text-critical`, `bg-warning/12`, `bg-sidebar-primary`, etc.

### Radio y tipografía

- `--radius`: `0.5rem`. Escala `rounded-sm` … `rounded-4xl` derivada.
- Fuente: **Manrope** 400–800 (`--font-sans`). Cargada en `__root.tsx`.
- `letter-spacing: 0`. No usar tracking decorativo.
- Números: `tabular-nums`.
- Moneda: `S/` con miles (ej. `S/ 1,280.00`).

### Dark mode

Existe bloque `.dark` para tokens shadcn/sidebar/charts. **No están definidos en `.dark`:** `--success`, `--warning`, `--warning-foreground`, `--info`, `--critical`, `--critical-foreground`. El prototipo actual es light. No activar dark ni “completar” esa paleta en una tarea de módulo.

---

## 3. Densidad y composición (copiar del dashboard)

### Página de módulo

```
AppShell
  main.min-w-0.flex-1.bg-background.p-3.sm:p-5.lg:p-6
    section.mx-auto.w-full.max-w-[1680px]
```

- Grillas: `gap-3` o `gap-4`. Filtros: `mt-5`; bloques siguientes: `mt-4`.
- Cards ERP: **`shadow-xs`**, no el `shadow` default de `Card`.
- Padding de card ERP: `p-4` (no el `p-6` default de shadcn `Card`).
- `SectionCard` header: `px-4 py-3.5`, `border-b border-border`.
- Evitar overflow: `min-w-0` en columnas y títulos `truncate`.

### Tipo

| Rol | Clases |
| --- | --- |
| Eyebrow / fecha | `text-xs font-semibold text-primary` |
| Título de página (main) | `text-xl font-bold sm:text-2xl` |
| Título de header | `text-base font-bold sm:text-lg` |
| Breadcrumb | `text-[11px] text-muted-foreground` — patrón `Inicio / Taller / Recepción` |
| Título de sección | `text-sm font-bold` |
| Subtítulo de sección | `text-[11px] text-muted-foreground` |
| Label de métrica | `text-xs font-medium text-muted-foreground` |
| Valor de métrica | `text-lg font-bold tabular-nums 2xl:text-xl` |
| Cuerpo denso / filas | `text-xs` |
| Meta / hora | `text-[10px]` o `text-[11px] text-muted-foreground` |
| Label de grupo sidebar | `text-[10px] font-bold uppercase` |

### Botones y CTAs

Variantes shadcn: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.
Tamaños: `default` (`h-9`), `sm`, `lg`, `icon`.

- Acción primaria de módulo: `Button` default (`bg-primary`).
- Acción crítica de taller/POS (crear OT, cobrar):  
  `className="bg-critical text-critical-foreground hover:bg-critical/90"`  
  No crear variante `critical` en `button.tsx` salvo que C-003 lo decida; el dashboard lo aplica por clase.
- Filtro aplicado: `variant="secondary"`.
- Acciones de card: `variant="link" size="sm"` o kebab `ghost` `size-7`.

### Badges y estados

| Situación | Pieza |
| --- | --- |
| Estado de OT, cita, stock, pago | `StatusBadge` |
| Chip de placa | `rounded-md bg-primary px-2 py-1 text-[11px] font-black text-primary-foreground` |
| Badge de menú (conteo) | `text-xs font-semibold` al final del item |
| Ícono de métrica warning | `bg-warning/12 text-warning` |
| Ícono de métrica danger | `bg-destructive/10 text-destructive` |
| Default de métrica | `bg-primary/10 text-primary` |

No usar `ui/badge` para estados de taller.

### Tablas y listas densas

Aún no hay tablas de negocio. Cuando existan:

- Usar `src/components/ui/table.tsx`.
- Filas al estilo dashboard: `divide-y divide-border`, padding `py-2.5` / `py-3`.
- Texto de celda `text-xs`; secundario `text-[11px] text-muted-foreground`.
- Estados con `StatusBadge`.

### Filtros

Barra del dashboard: `rounded-lg border border-border bg-card p-3 shadow-xs`.
Controles: `Select`, `Input type="date"`, `Button` Aplicar.
Repetir este bloque; no inventar filter drawers distintos.

### Charts

`ChartContainer` + `ChartTooltip` / `ChartTooltipContent`.
`isAnimationActive={false}`. Grid `strokeDasharray="3 3"`, ejes sin lineas.
No añadir librerías de chart.

---

## 4. Copy y datos canónicos

UI en **español (Perú)**.

- Sedes: La Molina, Surco, San Miguel.
- Usuario de demo: Carlos Mendoza / Administrador / iniciales `CM`.
- Placas: `ABC-123`, `B4X-521`, `F6T-884`.
- OT: `OT-2026-0184` (y vecinas 0187, 0182, 0178).
- Factura: `F001-00982`.
- Cliente citado: Lucía Ramos.

No renombrar estos identificadores. Los seeds (OpenCode) deben coincidir.

---

## 5. Huecos reales (no son un rediseño)

Inventario factual. **No implementarlos en esta auditoría.**

| Hueco | Hecho actual | Quién lo cubre |
| --- | --- | --- |
| Navegación muerta | ~~Subítems del sidebar usan `href="#dashboard-content"`.~~ Resuelto en C-002/C-041: `Link` + contrato `nav.ts`. | C-041 |
| Bahías ausentes | El menú Taller no lista «Bahías del taller». | C-002 |
| Breadcrumbs del header | Ya son dinámicos (C-003). Pulido final en C-041. | C-041 |
| Page header de módulo | `PageHeader` + `ModulePage` existen. | Hecho (C-003) |
| Loading / empty / error | Hay `skeleton` y `alert`; no hay estados ERP reutilizables. | O-006 |
| Datos hardcodeados | Métricas, charts, actividad, citas y stock viven como `const` en `index.tsx`. Filtros no filtran. Búsqueda no busca. | O-047 + C-034 / C-035 / C-040 |
| Caja del footer | Texto fijo «Caja abierta · Turno desde 08:00». | C-033 |
| Item activo | Dashboard siempre `isActive`. | C-002 |
| `html lang="en"` | La UI es español. | Ajuste menor futuro; no es rediseño |
| Tokens dark incompletos | Faltan success/warning/info/critical en `.dark`. | No activar dark |
| Imports muertos en sidebar | `ClipboardList`, `ReceiptText` no se usan. | Limpieza menor; no cambiar look |

---

## 6. Chrome de módulo (C-003)

| Pieza | Archivo | Uso |
| --- | --- | --- |
| `PageHeader` | `page-header.tsx` | Título `text-base font-bold`, breadcrumb `text-[11px]`. Lo usa `AppHeader`. |
| `ModulePage` | `module-page.tsx` | `main` + `max-w-[1680px]` + padding del dashboard. Slots `status`: ready / loading / empty / error. |
| `PageChromeProvider` | `page-chrome.tsx` | Contexto opcional para override de título/breadcrumb. Montado en `AppShell`. |
| Data-states | `data-states.tsx` | OpenCode / O-006. `ModulePage` los **importa**; no reimplementar. |

`AppHeader` deja de hardcodear Dashboard: usa `chromeFromPath` + override de `ModulePage`.
El dashboard `/` sigue resolviendo `Inicio / Dashboard` y no cambia su composición visual.

---

## 7. Reglas para el resto del backlog

1. **No rediseñar.** Misma tipografía, radio, sombras, densidad y tokens.
2. **No nuevas paletas** ni componentes que dupliquen shadcn (`ui/*`).
3. **Toda pantalla de módulo** entra por `AppShell`.
4. **KPIs → `MetricCard`. Bloques → `SectionCard`. Estados → `StatusBadge`.**
5. CTA crítico de operación → `bg-critical`, no un botón “hero” nuevo.
6. Placa de vehículo → chip `bg-primary` + `font-black`, como en «Vehículos listos pronto».
7. Copy en español. Moneda `S/`. IDs canónicos del dashboard.
8. Frontend only: mocks, no API real.
9. No tocar `src/routeTree.gen.ts` a mano.
10. No reescribir `src/routes/index.tsx` hasta C-034 (conectar mocks, mismo layout).

---

## 8. Referencias rápidas

- Tokens: `src/styles.css`
- Shell: `src/components/erp/app-shell.tsx`
- Dashboard (source of truth visual): `src/routes/index.tsx`
- Primitivos ERP: `src/components/erp/dashboard-ui.tsx`
- Routing file-based: `src/routes/README.md`
- Tablero: `tasks/TASKS.md`
