#!/usr/bin/env node
/**
 * Genera il sito statico partendo dal server gia' costruito.
 *
 *   1. avvia .output/server/index.mjs su una porta locale
 *   2. chiede al server ogni pagina pubblica
 *   3. salva la risposta come file .html
 *   4. copia gli asset statici
 *   5. spegne il server
 *
 * Perche' non il prerenderer di TanStack/nitro: su questa macchina fallisce
 * (`spawn npx ENOENT`, un problema di spawn su Windows) e in generale e'
 * una scatola chiusa. Qui il processo e' esplicito e verificabile: se una
 * pagina non torna 200, l'export si ferma e dice quale.
 *
 * Uso:
 *   node scripts/static/export.mjs --out=dist
 *   node scripts/static/export.mjs --out=dist --base-url=https://matricerealestate.it
 */

import { spawn } from "node:child_process";
import { cp, mkdir, writeFile, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = resolve(QUI, "../..");
const SERVER = join(RADICE, ".output/server/index.mjs");
const PUBBLICO = join(RADICE, ".output/public");

/* ------------------------------------------------------------ argomenti */

const argomenti = Object.fromEntries(
  process.argv.slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...v] = a.slice(2).split("=");
      return [k, v.join("=") || true];
    }),
);

const CARTELLA = resolve(RADICE, String(argomenti["out"] ?? "dist"));
const PORTA = Number(argomenti["port"] ?? 8791);
const BASE = String(argomenti["base-url"] ?? "");

/* --------------------------------------------------------------- utili */

const log = (m) => console.log(`  ${m}`);

async function attendiServer(url, tentativiMax = 120) {
  for (let i = 0; i < tentativiMax; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (r.status > 0) return true;
    } catch {
      /* non ancora pronto */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

/**
 * Percorso del file per una rotta.
 *   /                -> index.html
 *   /immobili        -> immobili/index.html
 *   /immobili/x-1    -> immobili/x-1/index.html
 *
 * Si usa sempre <rotta>/index.html: cosi' l'URL funziona con e senza
 * barra finale su qualunque server statico, GitHub Pages compreso.
 */
function percorsoFile(rotta) {
  const pulita = rotta.replace(/^\/+|\/+$/g, "");
  return pulita === "" ? "index.html" : join(pulita, "index.html");
}

/* ------------------------------------------------- elenco delle rotte */

/**
 * Le rotte da salvare. Quelle degli immobili arrivano dall'API del server
 * appena avviato: cosi' l'elenco e' sempre quello vero, non una lista
 * scritta a mano che si disallinea.
 */
async function raccogliRotte(origine) {
  const fisse = ["/", "/immobili", "/privacy-policy", "/cookie-policy"];

  const r = await fetch(`${origine}/api/properties`);
  if (!r.ok) throw new Error(`/api/properties ha risposto ${r.status}`);
  const dati = await r.json();

  if (!dati.disponibile) {
    throw new Error(
      "L'API dice che il database non e' raggiungibile: l'export " +
        "produrrebbe un sito senza immobili. Controllare IDEALISTA_DB_FILE " +
        "o il binding D1 prima di continuare.",
    );
  }

  const schede = dati.immobili.map((i) => `/immobili/${i.slug}`);
  log(`rotte: ${fisse.length} fisse + ${schede.length} schede immobile`);
  return { rotte: [...fisse, ...schede], dati };
}

/* ------------------------------------------------------------- export */

async function main() {
  console.log("\nEXPORT STATICO\n");

  if (!existsSync(SERVER)) {
    throw new Error(
      `Manca ${SERVER}.\nEseguire prima: NITRO_PRESET=node-server bun run build`,
    );
  }

  // 1. Avvio del server costruito.
  log(`avvio del server sulla porta ${PORTA}`);
  const server = spawn(process.execPath, [SERVER], {
    env: { ...process.env, PORT: String(PORTA), HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let erroreServer = "";
  server.stderr.on("data", (d) => (erroreServer += d.toString()));

  const origine = `http://127.0.0.1:${PORTA}`;
  const spegni = () => {
    try {
      server.kill();
    } catch {
      /* gia' terminato */
    }
  };

  try {
    if (!(await attendiServer(origine))) {
      throw new Error(`Il server non risponde.\n${erroreServer.slice(-500)}`);
    }
    log("server pronto");

    // 2. Rotte da salvare.
    const { rotte } = await raccogliRotte(origine);

    // 3. Cartella pulita, con dentro gli asset statici.
    await rm(CARTELLA, { recursive: true, force: true });
    await mkdir(CARTELLA, { recursive: true });
    if (existsSync(PUBBLICO)) {
      await cp(PUBBLICO, CARTELLA, { recursive: true });
      log(`asset statici copiati da .output/public`);
    }

    // 4. Una richiesta per rotta, salvata come HTML.
    let salvate = 0;
    const falliti = [];

    for (const rotta of rotte) {
      const risposta = await fetch(origine + rotta, {
        headers: { "User-Agent": "matrice-static-export/1.0" },
      });
      if (!risposta.ok) {
        falliti.push(`${rotta} -> HTTP ${risposta.status}`);
        continue;
      }
      let html = await risposta.text();

      // Gli URL assoluti servono a Open Graph e al canonical: in pagina
      // sono relativi, qui diventano assoluti se e' stato dato --base-url.
      if (BASE) {
        const b = BASE.replace(/\/+$/, "");
        html = html
          .replace(/(<link rel="canonical" href=")(\/[^"]*)"/g, `$1${b}$2"`)
          .replace(/(<meta property="og:url" content=")(\/[^"]*)"/g, `$1${b}$2"`)
          .replace(/(<meta property="og:image" content=")(\/[^"]*)"/g, `$1${b}$2"`);
      }

      const destinazione = join(CARTELLA, percorsoFile(rotta));
      await mkdir(dirname(destinazione), { recursive: true });
      await writeFile(destinazione, html, "utf8");
      salvate++;
    }

    if (falliti.length > 0) {
      throw new Error(
        `${falliti.length} pagine non salvate:\n    ` + falliti.join("\n    "),
      );
    }
    log(`${salvate} pagine salvate`);

    // 5. L'API come file statico: le pagine non ne hanno bisogno (i dati
    //    sono gia' dentro l'HTML) ma resta consultabile.
    const api = await (await fetch(`${origine}/api/properties`)).text();
    await mkdir(join(CARTELLA, "api/properties"), { recursive: true });
    await writeFile(join(CARTELLA, "api/properties/index.json"), api, "utf8");
    log("api/properties/index.json salvato");

    // 6. 404 di cortesia: GitHub Pages lo serve per le rotte sconosciute.
    const notFound = await fetch(`${origine}/rotta-inesistente-per-404`);
    await writeFile(join(CARTELLA, "404.html"), await notFound.text(), "utf8");
    log("404.html salvato");

    // 7. .nojekyll: senza, GitHub Pages ignora le cartelle che iniziano
    //    con underscore, e gli asset di Vite ci finiscono dentro.
    await writeFile(join(CARTELLA, ".nojekyll"), "", "utf8");
    log(".nojekyll salvato");

    const voci = await readdir(CARTELLA);
    console.log(`\n  Sito statico in ${CARTELLA}`);
    console.log(`  ${voci.length} voci in radice, ${salvate} pagine HTML\n`);
  } finally {
    spegni();
  }
}

main().catch((e) => {
  console.error("\nERRORE:", e instanceof Error ? e.message : e, "\n");
  process.exit(1);
});
