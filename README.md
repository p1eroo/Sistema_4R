# 4 RUEDAS — Sistema de gestión

Prototipo frontend del ERP de **4 RUEDAS Mecánica Automotriz**: taller, punto de venta,
inventario, compras, clientes, reportes y configuración.

- **Solo frontend**: no hay backend ni base de datos. Los datos viven en servicios mock en memoria
  (`src/mocks`) y se reinician al recargar.
- Stack: TanStack Start (React 19), Tailwind CSS 4, shadcn/ui, Radix, Lucide.
- Reglas para agentes y flujo de tareas: [`AGENTS.md`](./AGENTS.md) y [`tasks/`](./tasks/README.md).
- Convenciones visuales: [`src/components/erp/CONVENTIONS.md`](./src/components/erp/CONVENTIONS.md).

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating). This project uses **npm** as the only package manager (`package-lock.json`).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Despliegue (Cloudflare Workers)

`npm run build` compila para Cloudflare Workers con archivos estáticos (salida en `.output/`)
y genera la configuración de Wrangler, incluido el flag `nodejs_compat`.

En el proyecto de Cloudflare (Workers & Pages → proyecto `4ruedas`, conectado a este repositorio):

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

El nombre del Worker está fijado en `vite.config.ts` (`wrangler.name`) y debe coincidir con el
nombre del proyecto en Cloudflare.

Para compilar para otro destino: `NITRO_PRESET=node-server npm run build`.
