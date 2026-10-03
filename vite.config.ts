import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  css: { transformer: "lightningcss" },
  resolve: {
    alias: { "@": `${process.cwd()}/src` },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Entrada de servidor propia (src/server.ts): envuelve los errores de SSR.
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    // Nitro solo empaqueta el servidor en build; en dev sirve Vite.
    // Destino: Cloudflare Workers con archivos estáticos. Genera el
    // wrangler.json, así el despliegue es `npx wrangler deploy` sin más ajustes.
    // Para otro destino: NITRO_PRESET=node-server npm run build.
    ...(command === "build"
      ? [
          nitro({
            preset: process.env["NITRO_PRESET"] ?? "cloudflare_module",
            cloudflare: {
              deployConfig: true,
              nodeCompat: true,
              // Debe coincidir con el nombre del proyecto en Cloudflare.
              wrangler: { name: "4ruedas" },
            },
          }),
        ]
      : []),
    viteReact(),
  ],
}));
