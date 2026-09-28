/**
 * Configurazione Vite del sito.
 *
 * Sostituisce `@lovable.dev/vite-tanstack-config`, che faceva da involucro
 * attorno a questi stessi plugin. Il wrapper fissava il preset di nitro e la
 * forma dell'output: comodo finche' si resta sulla piattaforma, ma impedisce
 * di scegliere un target diverso (per esempio un export statico).
 *
 * Qui i plugin sono chiamati direttamente, cosi' il target e' una nostra
 * decisione. Il preset resta `cloudflare-module` come prima: il binding D1
 * `IDEALISTA_DB` e le rotte /api funzionano solo dentro un Worker.
 * Per cambiarlo basta NITRO_PRESET, senza toccare questo file.
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

/**
 * Percorso di src. Si passa da fileURLToPath e non da URL.pathname:
 * su Windows quest'ultimo restituisce "/C:/..." con lo slash iniziale,
 * che rolldown rifiuta (os error 123).
 */
const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "src");

export default defineConfig(({ mode }) => {
  // Le variabili VITE_* devono arrivare al bundle del client: e' cosi' che
  // il form contatti trova VITE_CONTACT_ENDPOINT. loadEnv legge .env,
  // .env.local e simili; Vite espone da solo quelle con prefisso VITE_.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      // tsConfigPaths prima degli altri: risolve l'alias "@/..." di tsconfig
      // per tutti i plugin che vengono dopo.
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tailwindcss(),
      // Genera src/routeTree.gen.ts e collega le rotte server.
      // `server.entry` punta a src/server.ts, l'involucro che intercetta
      // gli errori SSR: senza, nitro userebbe il proprio entry.
      tanstackStart({ server: { entry: "server" } }),
      viteReact(),
      // L'endpoint /mcp e la sua metadata OAuth. Unico pezzo di Lovable
      // rimasto: e' una funzionalita', non un vincolo sul build.
      mcpPlugin(),
      // Solo in build: produce .output/ per il target scelto.
      //
      // Il preset va dichiarato: senza, nitro ripiega su "node-server" e il
      // build perde wrangler.json, quindi il binding D1 IDEALISTA_DB. Il
      // wrapper di Lovable lo impostava di nascosto; qui e' esplicito.
      // NITRO_PRESET dell'ambiente ha comunque la precedenza, cosi' si puo'
      // provare un altro target senza modificare questo file.
      nitro({ preset: process.env["NITRO_PRESET"] || "cloudflare-module" }),
    ],

    resolve: {
      alias: { "@": SRC },
      // React e TanStack devono esistere in una sola copia: due istanze
      // rompono gli hook e il contesto del router.
      dedupe: [
        "react",
        "react-dom",
        "@tanstack/react-router",
        "@tanstack/react-start",
        "@tanstack/react-query",
      ],
    },

    define: {
      // Alcune dipendenze leggono process.env.NODE_ENV anche nel browser.
      "process.env.NODE_ENV": JSON.stringify(mode),
    },

    server: {
      port: Number(env["PORT"] ?? 8080),
      host: true,
    },

    preview: {
      port: Number(env["PORT"] ?? 8080),
      host: true,
    },
  };
});
