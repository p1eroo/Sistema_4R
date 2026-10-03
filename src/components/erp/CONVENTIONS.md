# 4 RUEDAS — convenciones visuales y de implementación (v2 Glass)

Esta guía es la fuente de verdad visual para cualquier módulo.
Desde PHASE 11 el lenguaje visual es **Glass suave**: superficies de vidrio muy sutil sobre un fondo casi plano
con un degradado tenue de marca. Se hace **solo con CSS** (`backdrop-filter`): sin WebGL, canvas ni librerías.
Solo tema claro.

Si esta sección contradice un apartado posterior, **manda esta sección**.

---

## 0. Sistema Glass

### Superficies

| Utilidad       | Opacidad | Dónde se usa                                                                                 |
| -------------- | -------- | -------------------------------------------------------------------------------------------- |
| `glass`        | 86%      | Tarjetas, KPIs, sidebar, header, toolbars de filtros, tarjetas de producto.                  |
| `glass-strong` | 95%      | Contenido denso: tablas, formularios, paneles de detalle, diálogos, sheets, popovers, menús. |
| `glass-subtle` | 60%      | Superficies secundarias dentro de otra superficie: notas, estados vacíos, footers.           |

Las tres ponen borde, sombra, brillo superior y desenfoque. **No añadir** `border border-border`, `bg-card`
ni `shadow-xs` encima: la utilidad ya lo trae.

- Componente: `Surface` (`src/components/erp/surface.tsx`) con `level="default" | "strong" | "subtle"`.
  Preferir `Surface` o `Card` antes que un `div` con clases sueltas.
- `Card` de shadcn ya es `glass`. `SectionCard` y `MetricCard` lo heredan.
- Prohibido el patrón antiguo `rounded-xl border border-border bg-card shadow-xs` fuera de `Surface`.

### Capas flotantes y shell (vidrio medio)

El contenido usa el vidrio suave de la tabla anterior. Lo que **flota sobre el contenido** usa un vidrio más
translúcido y con más desenfoque, para que se note la profundidad:

- `glass-float`: popovers, dropdowns, selects, context menus, hover cards y paneles laterales. Ya está en los
  primitivos de `src/components/ui/`; no reaplicar en los módulos.
- Sidebar y header son **tarjetas flotantes**: separados del borde de la ventana, con esquinas `rounded-lg`, vidrio medio y borde fino, sin sombra. No pegarlos a los bordes ni añadir bordes laterales.
- Ítem activo del menú: fondo `primary` sólido con texto blanco; subítem activo: fondo tenue con texto `primary` en seminegrita.

Tipografía de menús (ya en los primitivos, no sobrescribir en los módulos):

| Elemento          | Clases                                                  |
| ----------------- | ------------------------------------------------------- |
| Item              | `h-8 rounded-md px-2 text-[13px] font-medium`           |
| Etiqueta de grupo | `text-[10px] font-bold uppercase text-muted-foreground` |
| Atajo de teclado  | `font-mono text-[10px] text-muted-foreground`           |
| Popover           | `p-3 text-[13px]`                                       |
| Tooltip           | oscuro, `text-[11px] font-medium`                       |

### Modales (`Dialog`, `AlertDialog`)

Los modales **no son de vidrio**: son blancos y opacos, para que el formulario se lea sin ruido.
Todo esto ya lo trae el primitivo; en los módulos solo se compone el contenido.

- Superficie: blanca, `rounded-3xl`, sombra flotante. Fondo oscurecido con desenfoque leve.
- Cabecera (`DialogHeader`): título `text-lg font-extrabold`, descripción `text-xs`, línea divisoria debajo, X redonda arriba a la derecha.
- Cuerpo: etiquetas `text-xs font-semibold`; campos en columnas con `gap-3`.
- Pie (`DialogFooter`): botones en píldora (`h-10 rounded-full px-5`), secundario `outline` a la izquierda y primario a la derecha.
  Usar siempre `DialogFooter` sin clases de espaciado. En formularios embebidos, el botón `type="submit"` y el
  botón inmediatamente anterior toman la forma de píldora automáticamente.
- Opciones seleccionables dentro de un modal: tarjetas `rounded-xl border` con título en negrita y descripción; la activa con `border-primary ring-1 ring-primary/30`.

### Dónde NO va desenfoque

`backdrop-filter` cuesta. Solo en superficies grandes. **Sin blur** en elementos repetidos:
filas de tabla, items de lista, chips, badges, botones, inputs. Para esos usar fondos translúcidos planos:
`bg-white/70` (control), `bg-white/40` (fila hover), `bg-primary/5` (seleccionado).

### Fondo

Lo pinta `body::before` (degradados `radial-gradient` fijos, definidos en `styles.css` como `--app-backdrop`).
`main` y los contenedores de página son **transparentes**: no usar `bg-background` en wrappers de página.

### Radio, sombra y borde

- `--radius`: `0.5rem`. Superficies: `rounded-xl` = 12px (lo aplica `glass`). Controles internos: `rounded-lg`.
- Sombra: la de `glass` (`--glass-shadow`). No usar `shadow`, `shadow-md` en superficies.
- Separadores internos: `border-border/60` o `divide-border/60`.

### Legibilidad

- Texto denso (`text-xs` o menor) siempre sobre `glass-strong`.
- Contraste AA: `text-muted-foreground` no baja de 4.5:1 sobre vidrio; no usar texto con opacidad menor a 70%.
- Foco visible: mantener `ring` de shadcn.

### Fallbacks (ya incluidos en las utilidades)

- Sin soporte de `backdrop-filter` → superficie casi sólida.
- `prefers-reduced-transparency: reduce` → superficie sólida sin blur.

### Receta rápida de migración (para tareas de rollout)

| Antes                                               | Después                                |
| --------------------------------------------------- | -------------------------------------- |
| `rounded-xl border border-border bg-card shadow-xs` | `<Surface>` (o clase `glass`)          |
| Contenedor de tabla / formulario con `bg-card`      | `<Surface level="strong">`             |
| `bg-card` en un input o select de toolbar           | quitar (el primitivo ya trae su fondo) |
| `bg-muted/40` en cabecera de tabla                  | `bg-white/40`                          |
| `bg-background` en wrapper de página                | quitar                                 |
| `divide-border`, `border-border` internos           | `divide-border/60`, `border-border/60` |
| `shadow-xs` suelto                                  | quitar                                 |

---

## 1. Qué ya existe y se reutiliza tal cual

### Shell ERP (obligatorio en todo módulo)

| Pieza        | Archivo                              | Uso                                                                       |
| ------------ | ------------------------------------ | ------------------------------------------------------------------------- |
| `AppShell`   | `src/components/erp/app-shell.tsx`   | Envuelve **todas** las páginas autenticadas. Sidebar 16rem / icon 4.5rem. |
| `AppSidebar` | `src/components/erp/app-sidebar.tsx` | Navegación. No duplicar menús laterales.                                  |
| `AppHeader`  | `src/components/erp/app-header.tsx`  | Header sticky `h-16`, `glass`, búsqueda + sede + perfil.                  |

No crear layouts paralelos, top-nav alternativas ni páginas fuera de `AppShell`.

### Primitivos ERP

| Pieza                  | Archivo            | Uso                                                                                                                                                                                                                                    |
| ---------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MetricCard`           | `dashboard-ui.tsx` | KPI: label `text-xs`, valor `text-lg font-bold tabular-nums`, ícono `size-9`, énfasis `default \| warning \| danger`. Card `shadow-xs`.                                                                                                |
| `SectionCard`          | `dashboard-ui.tsx` | Bloque de contenido: título `text-sm font-bold`, subtítulo `text-[11px] text-muted-foreground`, header con `border-b`, body `p-4`.                                                                                                     |
| Ayuda de `SectionCard` | `dashboard-ui.tsx` | Prop `help`: muestra un botón de ayuda (ícono de interrogación) que abre un popover. Texto corto en segunda persona: para qué sirve el bloque y qué hacer para continuar. Sin `help` ni `action`, la cabecera no muestra ningún botón. |
| `StatusBadge`          | `dashboard-ui.tsx` | Estado operativo: `info \| success \| warning \| danger \| neutral`. `text-[10px] font-bold`, `rounded-md px-2 py-1`.                                                                                                                  |

Para estados de negocio (OT, stock, citas) usar `StatusBadge`, no `Badge` de shadcn.

### Primitivos UI (shadcn / Radix, New York)

Viven en `src/components/ui/`. **No crear equivalentes.**

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toggle`, `toggle-group`, `tooltip`.

Iconos: solo `lucide-react`. Charts: solo `recharts` + `ChartContainer`.

---

## 2. Tokens semánticos

Definidos en `src/styles.css` (`:root` + `@theme inline`). Colores en **oklch**. No añadir paletas hex/rgb ni nuevas familias de color.

### Color (light — tema de producto)

| Token                                    | Uso en el ERP                                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| `primary` / `primary-foreground`         | Azul de marca. Acciones default, chips de placa, íconos de métrica, marca 4R.            |
| `background` / `foreground`              | Lienzo de módulo (`bg-background`) y texto.                                              |
| `card` / `card-foreground`               | Superficies, header, filtros.                                                            |
| `muted` / `muted-foreground`             | Fondos suaves, labels, breadcrumbs, detalles.                                            |
| `secondary` / `secondary-foreground`     | Botón aplicado / secundario.                                                             |
| `accent` / `accent-foreground`           | Hover de ghost/outline.                                                                  |
| `border` / `input` / `ring`              | Bordes, inputs, focus.                                                                   |
| `destructive` / `destructive-foreground` | Peligro, trend down, badge danger, punto de notificación.                                |
| `success`                                | Trend up (`text-success`), badge success.                                                |
| `warning` / `warning-foreground`         | Atención (presupuestos, CxC). Badge warning usa `bg-warning/12 text-warning-foreground`. |
| `info`                                   | Badge informativo.                                                                       |
| `critical` / `critical-foreground`       | CTA de operación urgente (ej. «Nueva orden»). **No es lo mismo que `destructive`.**      |
| `chart-1` … `chart-5`                    | Series. En dashboard: diagnosis / reparación / control / listo.                          |
| `sidebar-*`                              | Solo el menú lateral.                                                                    |

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

- El `main` usa `pt-4` desde `sm`: el título queda con el mismo espacio arriba (hasta el header) que abajo (hasta el contenido).
- Grillas: `gap-3` o `gap-4`. Filtros: `mt-5`; bloques siguientes: `mt-4`.
- Cards ERP: superficie `glass` (ver §0); sin `shadow-xs` ni `bg-card` manuales.
- Padding de card ERP: `p-4` (no el `p-6` default de shadcn `Card`).
- `SectionCard` header: `px-4 py-3.5`, `border-b border-border`.
- Evitar overflow: `min-w-0` en columnas y títulos `truncate`.

### Tipo

| Rol                     | Clases                                                                     |
| ----------------------- | -------------------------------------------------------------------------- |
| Eyebrow / fecha         | `text-xs font-semibold text-primary`                                       |
| Título de página (main) | `text-xl font-bold sm:text-2xl`                                            |
| Título de header        | `text-base font-bold sm:text-lg`                                           |
| Breadcrumb              | `text-[11px] text-muted-foreground` — patrón `Inicio / Taller / Recepción` |
| Título de sección       | `text-sm font-bold`                                                        |
| Subtítulo de sección    | `text-[11px] text-muted-foreground`                                        |
| Label de métrica        | `text-xs font-medium text-muted-foreground`                                |
| Valor de métrica        | `text-lg font-bold tabular-nums 2xl:text-xl`                               |
| Cuerpo denso / filas    | `text-xs`                                                                  |
| Meta / hora             | `text-[10px]` o `text-[11px] text-muted-foreground`                        |
| Label de grupo sidebar  | `text-[10px] font-bold uppercase`                                          |

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

| Situación                       | Pieza                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------- |
| Estado de OT, cita, stock, pago | `StatusBadge`                                                                    |
| Chip de placa                   | `rounded-md bg-primary px-2 py-1 text-[11px] font-black text-primary-foreground` |
| Badge de menú (conteo)          | `text-xs font-semibold` al final del item                                        |
| Ícono de métrica warning        | `bg-warning/12 text-warning`                                                     |
| Ícono de métrica danger         | `bg-destructive/10 text-destructive`                                             |
| Default de métrica              | `bg-primary/10 text-primary`                                                     |

No usar `ui/badge` para estados de taller.

### Tablas y listas densas

Aún no hay tablas de negocio. Cuando existan:

- Usar `src/components/ui/table.tsx`.
- Filas al estilo dashboard: `divide-y divide-border`, padding `py-2.5` / `py-3`.
- Texto de celda `text-xs`; secundario `text-[11px] text-muted-foreground`.
- Estados con `StatusBadge`.

### Filtros

Barra del dashboard: `glass p-3` (ver §0).
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

| Hueco                      | Hecho actual                                                                                                         | Quién lo cubre                      |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Navegación muerta          | ~~Subítems del sidebar usan `href="#dashboard-content"`.~~ Resuelto en C-002/C-041: `Link` + contrato `nav.ts`.      | C-041                               |
| Bahías ausentes            | El menú Taller no lista «Bahías del taller».                                                                         | C-002                               |
| Breadcrumbs del header     | Ya son dinámicos (C-003). Pulido final en C-041.                                                                     | C-041                               |
| Page header de módulo      | `PageHeader` + `ModulePage` existen.                                                                                 | Hecho (C-003)                       |
| Loading / empty / error    | Hay `skeleton` y `alert`; no hay estados ERP reutilizables.                                                          | O-006                               |
| Datos hardcodeados         | Métricas, charts, actividad, citas y stock viven como `const` en `index.tsx`. Filtros no filtran. Búsqueda no busca. | O-047 + C-034 / C-035 / C-040       |
| Caja del footer            | Texto fijo «Caja abierta · Turno desde 08:00».                                                                       | C-033                               |
| Item activo                | Dashboard siempre `isActive`.                                                                                        | C-002                               |
| `html lang="en"`           | La UI es español.                                                                                                    | Ajuste menor futuro; no es rediseño |
| Tokens dark incompletos    | Faltan success/warning/info/critical en `.dark`.                                                                     | No activar dark                     |
| Imports muertos en sidebar | `ClipboardList`, `ReceiptText` no se usan.                                                                           | Limpieza menor; no cambiar look     |

---

## 6. Chrome de módulo (C-003)

| Pieza                | Archivo           | Uso                                                                                                 |
| -------------------- | ----------------- | --------------------------------------------------------------------------------------------------- |
| `PageHeader`         | `page-header.tsx` | Título `text-base font-bold`, breadcrumb `text-[11px]`. Lo usa `AppHeader`.                         |
| `ModulePage`         | `module-page.tsx` | `main` + `max-w-[1680px]` + padding del dashboard. Slots `status`: ready / loading / empty / error. |
| `PageChromeProvider` | `page-chrome.tsx` | Contexto opcional para override de título/breadcrumb. Montado en `AppShell`.                        |
| Data-states          | `data-states.tsx` | OpenCode / O-006. `ModulePage` los **importa**; no reimplementar.                                   |

`AppHeader` deja de hardcodear Dashboard: usa `chromeFromPath` + override de `ModulePage`.
El dashboard `/` sigue resolviendo `Inicio / Dashboard` y no cambia su composición visual.

---

## 7. Reglas para el resto del backlog

1. **Seguir el sistema Glass de §0.** No inventar otra estética ni volver a superficies sólidas.
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
