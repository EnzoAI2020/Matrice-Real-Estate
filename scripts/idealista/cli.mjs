#!/usr/bin/env node
/**
 * Sincronizzazione idealista/tools — punto di ingresso.
 *
 *   node scripts/idealista/cli.mjs migrate --local
 *   node scripts/idealista/cli.mjs sync --file=feed.xml --local
 *   node scripts/idealista/cli.mjs sync --ftp
 *   node scripts/idealista/cli.mjs status --local
 *
 * L'ordine delle fasi e' deliberato: il download e il parsing avvengono PRIMA
 * di toccare il database, cosi' non si tiene aperta una transazione enorme
 * durante l'FTP e un feed corrotto non lascia dati a meta'.
 */

import { readFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseXml, estraiAnnunci } from "./xml.mjs";
import { normalizzaFeed } from "./normalize.mjs";
import { clientDaAmbiente, redigi } from "./ftp.mjs";
import { creaDriver } from "./db.mjs";
import { creaLogger, proteggi, oscura } from "./logger.mjs";
import { IdealistaPropertySyncService } from "./sync.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = resolve(QUI, "../..");

/**
 * Carica .env dalla radice del progetto, se c'e'.
 *
 * Usa process.loadEnvFile() di Node: nessuna dipendenza tipo dotenv.
 * Le variabili gia' presenti nell'ambiente VINCONO sul file, cosi' in CI i
 * secret del runner non vengono sovrascritti da un .env rimasto in giro.
 */
function caricaEnvLocale() {
  const percorso = join(RADICE, ".env");
  if (!existsSync(percorso)) return { caricato: false, percorso };
  const prima = new Set(Object.keys(process.env));
  try {
    process.loadEnvFile(percorso);
  } catch (e) {
    return { caricato: false, percorso, errore: e instanceof Error ? e.message : String(e) };
  }
  // Ripristina le variabili che esistevano gia': l'ambiente ha la precedenza.
  for (const chiave of prima) {
    if (originaleEnv[chiave] !== undefined) process.env[chiave] = originaleEnv[chiave];
  }
  return { caricato: true, percorso };
}

/** Istantanea dell'ambiente prima di leggere .env. */
const originaleEnv = { ...process.env };

/* ------------------------------------------------------------ argomenti */

function leggiArgomenti(argv) {
  const o = {
    comando: argv[0] && !argv[0].startsWith("--") ? argv[0] : "sync",
    file: null,
    ftp: false,
    local: false,
    dbFile: null,
    scope: [0],
    maxFoto: 200,
    trigger: "manual",
    dryRun: false,
    conservaGrezzo: false,
    noDeactivate: false,
  };

  for (const a of argv) {
    if (!a.startsWith("--")) continue;
    const [k, v] = a.slice(2).split("=");
    switch (k) {
      case "file": o.file = v; break;
      case "ftp": o.ftp = true; break;
      case "local": o.local = true; break;
      case "db": o.dbFile = v; break;
      case "scope":
        o.scope = String(v).split(",").map((x) => Number(x.trim())).filter(Number.isInteger);
        break;
      case "max-photos": o.maxFoto = Number(v); break;
      case "trigger": o.trigger = v; break;
      case "dry-run": o.dryRun = true; break;
      case "keep-raw": o.conservaGrezzo = true; break;
      case "no-deactivate": o.noDeactivate = true; break;
      case "help": o.help = true; break;
      default: console.warn(`opzione ignorata: --${k}`);
    }
  }
  return o;
}

const AIUTO = `
Sincronizzazione idealista/tools

  node scripts/idealista/cli.mjs migrate  --local
  node scripts/idealista/cli.mjs sync     --file=feed.xml --local
  node scripts/idealista/cli.mjs sync     --ftp
  node scripts/idealista/cli.mjs status   --local

Comandi
  migrate            applica scripts/idealista/migrations/*.sql
  sync               importa il feed
  status             mostra le ultime sincronizzazioni

Opzioni
  --file=PERCORSO    legge un XML locale invece dell'FTP
  --ftp              scarica da ftp.habitania.com (credenziali dall'ambiente)
  --local            usa SQLite locale (.data/idealista.sqlite) invece di D1
  --db=PERCORSO      file SQLite specifico
  --scope=0          scope pubblicabili, separati da virgola (default 0)
  --max-photos=N     massimo foto per annuncio (default 200)
  --trigger=NOME     etichetta salvata nel registro (manual|scheduled|local)
  --keep-raw         conserva l'annuncio grezzo in raw_json (debug)
  --no-deactivate    non disattivare gli assenti (utile al primo import)
  --dry-run          analizza e riporta senza scrivere nulla

Ambiente (mai nel repository)
  IDEALISTA_FTP_HOST, IDEALISTA_FTP_PORT, IDEALISTA_FTP_USER,
  IDEALISTA_FTP_PASSWORD, IDEALISTA_FTP_PATH, IDEALISTA_FTP_FILE
  CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN
  IDEALISTA_SYNC_ENABLED=true
`;

/* --------------------------------------------------------------- utili */

function percorsoDbLocale(o) {
  return o.dbFile ?? join(RADICE, ".data", "idealista.sqlite");
}

async function apriDb(o, env) {
  if (o.local || o.dbFile) {
    const file = percorsoDbLocale(o);
    await mkdir(dirname(file), { recursive: true });
    return creaDriver({ driver: "sqlite", file }, env);
  }
  return creaDriver({}, env);
}

/* ------------------------------------------------------------ migrate */

async function comandoMigrate(o, log, env) {
  const db = await apriDb(o, env);
  const sql = await readFile(join(QUI, "migrations", "0001_idealista.sql"), "utf8");
  await db.exec(sql);
  log.info("Migrazione applicata", {
    destinazione: o.local || o.dbFile ? percorsoDbLocale(o) : "Cloudflare D1",
  });
  await db.close();
}

/* ------------------------------------------------------------- status */

async function comandoStatus(o, log, env) {
  const db = await apriDb(o, env);
  const righe = await db.query(
    `SELECT id, status, trigger, started_at, completed_at, source_filename,
            records_received, records_created, records_updated, records_unchanged,
            records_deactivated, duration_ms, errors
       FROM idealista_syncs ORDER BY started_at DESC LIMIT 10`,
  );
  if (righe.length === 0) {
    console.log("\nNessuna sincronizzazione registrata.\n");
  } else {
    console.log("\nUltime sincronizzazioni\n");
    for (const r of righe) {
      console.log(
        `  #${String(r.id).padEnd(4)} ${String(r.status).padEnd(8)} ${r.started_at}` +
          `  ricevuti=${r.records_received} creati=${r.records_created}` +
          ` aggiornati=${r.records_updated} invariati=${r.records_unchanged}` +
          ` disattivati=${r.records_deactivated}` +
          (r.duration_ms ? ` (${(r.duration_ms / 1000).toFixed(1)}s)` : "") +
          (r.errors ? `\n        errori: ${r.errors}` : ""),
      );
    }
    console.log();
  }
  const attivi = await db.query(
    `SELECT status, COUNT(*) AS n FROM properties GROUP BY status`,
  );
  console.log("Immobili:", attivi.map((a) => `${a.status}=${a.n}`).join(" ") || "nessuno");
  console.log();
  await db.close();
}

/* --------------------------------------------------------------- sync */

async function comandoSync(o, log, env) {
  const inizio = Date.now();

  if (env["IDEALISTA_SYNC_ENABLED"] === "false") {
    log.warn("Sincronizzazione disabilitata da IDEALISTA_SYNC_ENABLED=false");
    return;
  }
  if (!o.file && !o.ftp) {
    throw new Error("Specificare --file=PERCORSO oppure --ftp");
  }

  // FASE 1 — reperimento del feed. Nessuna transazione aperta qui.
  let percorsoFeed;
  let nomeFile;
  let byte;
  const tempDir = join(RADICE, ".data", "feed");

  if (o.ftp) {
    const ftp = clientDaAmbiente(env, log.callback);
    const scaricato = await ftp.fetchFeed(tempDir, env["IDEALISTA_FTP_FILE"] ?? null);
    percorsoFeed = scaricato.path;
    nomeFile = scaricato.filename;
    byte = scaricato.bytes;
  } else {
    percorsoFeed = resolve(process.cwd(), o.file);
    nomeFile = o.file.split(/[\\/]/).pop();
    log.info("Feed letto da file locale", { file: percorsoFeed });
  }

  const xml = await readFile(percorsoFeed, "utf8");
  byte = byte ?? Buffer.byteLength(xml, "utf8");

  // FASE 2 — validazione strutturale prima di toccare il database.
  let annunci;
  try {
    annunci = estraiAnnunci(parseXml(xml));
  } catch (e) {
    throw new Error(`Parsing XML fallito, nessuna modifica al database: ${e.message}`);
  }
  if (!Array.isArray(annunci)) {
    throw new Error("Struttura del feed inattesa: <ads>/<ad> non trovati");
  }
  log.info("Feed analizzato", { annunci: annunci.length, file: nomeFile, byte });

  // FASE 3 — normalizzazione (pura, senza I/O).
  const { properties, images, scarti, errori, esclusiPerScope } = normalizzaFeed(annunci, {
    scopeAmmessi: o.scope,
    maxFoto: o.maxFoto,
    conservaGrezzo: o.conservaGrezzo,
  });
  log.info("Normalizzazione completata", {
    pubblicabili: properties.length,
    scartati: Object.values(scarti).reduce((a, b) => a + b, 0),
    errori: errori.length,
  });
  for (const [motivo, n] of Object.entries(scarti)) {
    log.info(`  scartati ${n}: ${motivo}`);
  }

  if (o.dryRun) {
    console.log("\n--dry-run: nessuna scrittura. Riepilogo:");
    console.log(`  annunci nel feed : ${annunci.length}`);
    console.log(`  pubblicabili     : ${properties.length}`);
    console.log(`  scarti           : ${JSON.stringify(scarti)}`);
    console.log(`  errori           : ${errori.length}`);
    console.log(`  immagini         : ${[...images.values()].reduce((n, a) => n + a.length, 0)}\n`);
    return;
  }

  // FASE 4 — scritture controllate.
  const db = await apriDb(o, env);
  const servizio = new IdealistaPropertySyncService({ db, log });
  let syncId = null;

  try {
    syncId = await servizio.acquisisciLock({ trigger: o.trigger });

    const { stats, idVisti } = await servizio.importaProprieta(syncId, properties, images);

    // Disattivazione per scope: istruzione esplicita della sorgente, quindi
    // NON subordinata a --no-deactivate. Un annuncio che idealista marca
    // "non pubblicabile" deve sparire dal sito subito.
    const esitoScope = await servizio.deactivateExcludedByScope(syncId, esclusiPerScope);

    // FASE 5 — disattivazione, solo a importazione riuscita.
    // Il feed e' "completo" se e' stato scaricato e analizzato per intero e
    // nessun immobile ha fallito la scrittura.
    const feedCompleto = errori.length === 0 && stats.errori.length === 0;
    const esitoDisattivazione = o.noDeactivate
      ? { disattivati: 0, saltato: "richiesto --no-deactivate" }
      : await servizio.deactivateMissing(syncId, { feedCompleto, idVisti });

    const durata = Date.now() - inizio;
    await servizio.completaSync(syncId, {
      status: stats.errori.length > 0 ? "success" : "success",
      sourceFilename: nomeFile,
      sourceBytes: byte,
      received: annunci.length,
      created: stats.created,
      updated: stats.updated,
      unchanged: stats.unchanged,
      skipped: Object.values(scarti).reduce((a, b) => a + b, 0),
      deactivated: esitoDisattivazione.disattivati + esitoScope.disattivati,
      imagesSynced: stats.imagesSynced,
      durationMs: durata,
      errors: [...errori, ...stats.errori],
      notes: esitoDisattivazione.saltato,
    });

    console.log("\nRIEPILOGO SINCRONIZZAZIONE");
    console.log(`  sync id        : ${syncId}`);
    console.log(`  file           : ${nomeFile} (${byte} byte)`);
    console.log(`  ricevuti       : ${annunci.length}`);
    console.log(`  creati         : ${stats.created}`);
    console.log(`  aggiornati     : ${stats.updated}`);
    console.log(`  invariati      : ${stats.unchanged}`);
    console.log(`  scartati       : ${Object.values(scarti).reduce((a, b) => a + b, 0)}`);
    console.log(`  disatt. scope  : ${esitoScope.disattivati}${esitoScope.disattivati ? ` (${esitoScope.id.join(", ")})` : ""}`);
    console.log(`  disatt. assenti: ${esitoDisattivazione.disattivati}${esitoDisattivazione.saltato ? ` (saltato: ${esitoDisattivazione.saltato})` : ""}`);
    console.log(`  immagini       : ${stats.imagesSynced}`);
    console.log(`  durata         : ${(durata / 1000).toFixed(1)}s`);
    if (errori.length || stats.errori.length) {
      console.log(`  errori         : ${errori.length + stats.errori.length}`);
    }
    console.log();
  } catch (e) {
    if (syncId !== null) {
      await servizio.fallisciSync(syncId, e instanceof Error ? e.message : String(e), {
        sourceFilename: nomeFile,
        sourceBytes: byte,
        received: annunci.length,
        durationMs: Date.now() - inizio,
      });
    }
    throw e;
  } finally {
    await db.close();
    if (o.ftp) await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

/* --------------------------------------------------------------- main */

async function main() {
  const o = leggiArgomenti(process.argv.slice(2));
  if (o.help) {
    console.log(AIUTO);
    return;
  }

  const env = process.env;
  const esitoEnv = caricaEnvLocale();

  // Registrati SUBITO, prima di qualunque log: password e token sono segreti;
  // account e database id non sono credenziali ma restano identificativi che
  // non ha senso spargere nei log (Cloudflare li rimanda dentro gli errori).
  for (const chiave of [
    "IDEALISTA_FTP_PASSWORD",
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_D1_DATABASE_ID",
  ]) {
    proteggi(env[chiave]);
  }

  const log = creaLogger();
  if (esitoEnv.caricato) log.debug("Caricato .env locale", { file: esitoEnv.percorso });
  else if (esitoEnv.errore) log.warn("Impossibile leggere .env", { errore: esitoEnv.errore });

  switch (o.comando) {
    case "migrate": return comandoMigrate(o, log, env);
    case "status": return comandoStatus(o, log, env);
    case "sync": return comandoSync(o, log, env);
    default:
      console.log(AIUTO);
      throw new Error(`Comando sconosciuto: ${o.comando}`);
  }
}

main().catch((e) => {
  // Doppia passata prima di stampare: redigi() copre utente/password FTP
  // anche se non sono stati registrati, oscura() tutti i segreti noti
  // (token e identificativi Cloudflare inclusi).
  const messaggio = oscura(
    redigi(
      e instanceof Error ? e.message : String(e),
      process.env["IDEALISTA_FTP_USER"],
      process.env["IDEALISTA_FTP_PASSWORD"],
    ),
  );
  console.error("\nERRORE:", messaggio, "\n");
  process.exit(1);
});
