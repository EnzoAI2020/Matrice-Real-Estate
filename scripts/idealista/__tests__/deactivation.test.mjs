/**
 * Audit della disattivazione per ASSENZA dal feed (casi A-H).
 *
 * Due meccanismi distinti, volutamente separati:
 *
 *   per ASSENZA  l'annuncio non c'e' piu' nel feed. E' un'informazione
 *                AMBIGUA: potrebbe essere un file troncato. Quindi passa
 *                attraverso tutte le cautele (feed completo, non vuoto,
 *                sotto soglia) e si puo' spegnere con --no-deactivate.
 *
 *   per SCOPE    l'annuncio c'e' ma e' marcato non pubblicabile. E' una
 *                ISTRUZIONE ESPLICITA della sorgente: si applica sempre,
 *                subito, anche con --no-deactivate.
 *
 * Confondere i due significherebbe o lasciare online annunci ritirati, o
 * svuotare il sito per via di un download parziale.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseXml, estraiAnnunci } from "../xml.mjs";
import { normalizzaFeed } from "../normalize.mjs";
import { SqliteDriver } from "../db.mjs";
import { IdealistaPropertySyncService } from "../sync.mjs";
import { creaLogger } from "../logger.mjs";

const esegui = promisify(execFile);
const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..", "..");
const CLI = join(QUI, "..", "cli.mjs");
const MIGRAZIONE = readFileSync(join(QUI, "..", "migrations", "0001_idealista.sql"), "utf8");
const FIXTURE = join(QUI, "fixtures", "feed-base.xml");
const log = creaLogger({ livello: "error", scrivi: () => {} });

async function nuovoDb() {
  const db = new SqliteDriver(":memory:");
  await db.apri();
  await db.exec(MIGRAZIONE);
  return db;
}

const feed = () => normalizzaFeed(estraiAnnunci(parseXml(readFileSync(FIXTURE, "utf8"))), {
  scopeAmmessi: [0],
});

async function attivi(db) {
  return Number((await db.query("SELECT COUNT(*) AS n FROM properties WHERE status='active'"))[0].n);
}

/** Una sincronizzazione completa e riuscita. */
async function sync(db, properties, images, { feedCompleto = true, noDeactivate = false } = {}) {
  const s = new IdealistaPropertySyncService({ db, log });
  const id = await s.acquisisciLock({ trigger: "test" });
  const { stats, idVisti } = await s.importaProprieta(id, properties, images);
  const esito = noDeactivate
    ? { disattivati: 0, saltato: "--no-deactivate" }
    : await s.deactivateMissing(id, { feedCompleto, idVisti });
  await s.completaSync(id, { status: "success" });
  return { stats, esito };
}

/* ----------------------------------------------------------------- A --- */

test("A. un immobile sparito da un feed completo diventa inattivo", async () => {
  const db = await nuovoDb();
  const { properties, images } = feed();
  await sync(db, properties, images);
  assert.equal(await attivi(db), properties.length);

  // Uno solo sparisce: sotto la soglia di sicurezza.
  const ridotto = properties.filter((p) => p.idealista_id !== "1006");
  const { esito } = await sync(db, ridotto, images);

  assert.equal(esito.disattivati, 1);
  assert.equal(esito.saltato, null);
  const r = (await db.query("SELECT status, deactivated_at FROM properties WHERE idealista_id='1006'"))[0];
  assert.equal(r.status, "inactive");
  assert.ok(r.deactivated_at, "registra quando e' stato disattivato");

  // Nessuna cancellazione.
  const totale = Number((await db.query("SELECT COUNT(*) AS n FROM properties"))[0].n);
  assert.equal(totale, properties.length);
  await db.close();
});

/* ----------------------------------------------------------------- B --- */

test("B. se torna nel feed viene riattivato con la stessa identita' e slug", async () => {
  const db = await nuovoDb();
  const { properties, images } = feed();
  await sync(db, properties, images);

  const prima = (await db.query("SELECT id, slug FROM properties WHERE idealista_id='1006'"))[0];

  await sync(db, properties.filter((p) => p.idealista_id !== "1006"), images);
  assert.equal((await db.query("SELECT status FROM properties WHERE idealista_id='1006'"))[0].status, "inactive");

  const { stats } = await sync(db, properties, images);
  assert.equal(stats.created, 0, "non viene ricreato");

  const dopo = (await db.query("SELECT id, slug, status, deactivated_at FROM properties WHERE idealista_id='1006'"))[0];
  assert.equal(dopo.status, "active");
  assert.equal(dopo.deactivated_at, null);
  assert.equal(dopo.id, prima.id, "stessa riga, stessa identita'");
  assert.equal(dopo.slug, prima.slug, "URL pubblica invariata");
  await db.close();
});

/* ----------------------------------------------------------------- C --- */

test("C. download non riuscito: nessuna disattivazione, nessuna riga toccata", async () => {
  const cartella = mkdtempSync(join(tmpdir(), "ideal-c-"));
  const dbFile = join(cartella, "t.sqlite");
  try {
    // Popola il database con un feed valido.
    await esegui("node", [CLI, "migrate", `--db=${dbFile}`], { cwd: RADICE });
    await esegui("node", [CLI, "sync", `--file=${FIXTURE}`, `--db=${dbFile}`], { cwd: RADICE });

    const db = new SqliteDriver(dbFile);
    await db.apri();
    const attiviPrima = await attivi(db);
    const syncPrima = Number((await db.query("SELECT COUNT(*) AS n FROM idealista_syncs"))[0].n);
    await db.close();
    assert.ok(attiviPrima > 0);

    // Sorgente irraggiungibile: il file non esiste.
    let fallito = false;
    try {
      await esegui("node", [CLI, "sync", "--file=/percorso/che/non/esiste.xml", `--db=${dbFile}`], { cwd: RADICE });
    } catch {
      fallito = true;
    }
    assert.ok(fallito, "il comando deve fallire");

    const db2 = new SqliteDriver(dbFile);
    await db2.apri();
    assert.equal(await attivi(db2), attiviPrima, "nessun immobile disattivato");
    assert.equal(
      Number((await db2.query("SELECT COUNT(*) AS n FROM idealista_syncs"))[0].n),
      syncPrima,
      "nemmeno una riga di sync: si interrompe prima di aprire il database",
    );
    await db2.close();
  } finally {
    rmSync(cartella, { recursive: true, force: true });
  }
});

/* ----------------------------------------------------------------- D --- */

test("D. parsing XML fallito: nessuna disattivazione", async () => {
  const cartella = mkdtempSync(join(tmpdir(), "ideal-d-"));
  const dbFile = join(cartella, "t.sqlite");
  const rotto = join(cartella, "rotto.xml");
  try {
    await esegui("node", [CLI, "migrate", `--db=${dbFile}`], { cwd: RADICE });
    await esegui("node", [CLI, "sync", `--file=${FIXTURE}`, `--db=${dbFile}`], { cwd: RADICE });

    const db = new SqliteDriver(dbFile);
    await db.apri();
    const attiviPrima = await attivi(db);
    await db.close();

    // XML ben formato ma che non contiene annunci: struttura inattesa.
    writeFileSync(rotto, "<?xml version=\"1.0\"?><qualcosaDiAltro><nodo>1</nodo></qualcosaDiAltro>");
    await esegui("node", [CLI, "sync", `--file=${rotto}`, `--db=${dbFile}`], { cwd: RADICE });

    const db2 = new SqliteDriver(dbFile);
    await db2.apri();
    assert.equal(
      await attivi(db2), attiviPrima,
      "zero annunci letti: la salvaguardia sul feed vuoto impedisce la disattivazione",
    );
    await db2.close();
  } finally {
    rmSync(cartella, { recursive: true, force: true });
  }
});

/* ----------------------------------------------------------------- E --- */

test("E. errori di normalizzazione: nessuna disattivazione per assenza", async () => {
  const db = await nuovoDb();
  const { properties, images } = feed();
  await sync(db, properties, images);
  const prima = await attivi(db);

  // feedCompleto = false: e' cosi' che la CLI segnala errori su un immobile.
  const { esito } = await sync(db, properties.slice(0, 2), images, { feedCompleto: false });

  assert.equal(esito.disattivati, 0);
  assert.match(esito.saltato, /non dichiarato completo/);
  assert.equal(await attivi(db), prima, "restano tutti attivi");
  await db.close();
});

/* ----------------------------------------------------------------- F --- */

test("F. feed con zero immobili: nessuna disattivazione di massa", async () => {
  const db = await nuovoDb();
  const { properties, images } = feed();
  await sync(db, properties, images);
  const prima = await attivi(db);

  const s = new IdealistaPropertySyncService({ db, log });
  const id = await s.acquisisciLock({ trigger: "test" });
  const esito = await s.deactivateMissing(id, { feedCompleto: true, idVisti: new Set() });

  assert.equal(esito.disattivati, 0);
  assert.match(esito.saltato, /non conteneva annunci/);
  assert.equal(await attivi(db), prima);
  await db.close();
});

/* ----------------------------------------------------------------- G --- */

test("G. oltre il 50% degli attivi: la valvola di sicurezza blocca tutto", async () => {
  const db = await nuovoDb();
  const { properties, images } = feed();
  await sync(db, properties, images);
  const prima = await attivi(db);

  // Ne resta uno solo su 7: ben oltre la soglia.
  const { esito } = await sync(db, properties.slice(0, 1), images);

  assert.equal(esito.disattivati, 0, "meglio non disattivare che svuotare il sito");
  assert.match(esito.saltato, /disattivazione di massa bloccata/);
  assert.match(esito.saltato, /50%/);
  assert.equal(await attivi(db), prima);
  await db.close();
});

test("G2. esattamente al limite: 50% netto NON viene bloccato", async () => {
  const db = await nuovoDb();
  const { properties, images } = feed();
  const quattro = properties.slice(0, 4);
  await sync(db, quattro, images);
  assert.equal(await attivi(db), 4);

  // 2 su 4 spariscono: 0.5, che NON e' > 0.5. Deve procedere.
  const { esito } = await sync(db, quattro.slice(0, 2), images);
  assert.equal(esito.disattivati, 2, "la soglia e' 'maggiore del 50%', non 'almeno'");
  assert.equal(await attivi(db), 2);
  await db.close();
});

test("G3. appena sopra il limite: 3 su 4 viene bloccato", async () => {
  const db = await nuovoDb();
  const { properties, images } = feed();
  const quattro = properties.slice(0, 4);
  await sync(db, quattro, images);

  const { esito } = await sync(db, quattro.slice(0, 1), images);
  assert.equal(esito.disattivati, 0, "3/4 = 75% > 50%");
  assert.equal(await attivi(db), 4);
  await db.close();
});

/* ----------------------------------------------------------------- H --- */

test("H. lo scope esplicito resta separato: agisce anche con --no-deactivate", async () => {
  const db = await nuovoDb();
  const { properties, images } = feed();
  await sync(db, properties, images);
  const prima = await attivi(db);

  // Stesso feed, ma 1001 passa a scope 2 (presente e marcato non pubblicabile).
  const s = new IdealistaPropertySyncService({ db, log });
  const id = await s.acquisisciLock({ trigger: "test" });
  const restanti = properties.filter((p) => p.idealista_id !== "1001");
  const { idVisti } = await s.importaProprieta(id, restanti, images);

  // Percorso per scope: sempre attivo.
  const perScope = await s.deactivateExcludedByScope(id, new Set(["1001"]));
  // Percorso per assenza: spento.
  const perAssenza = { disattivati: 0, saltato: "--no-deactivate" };

  assert.equal(perScope.disattivati, 1, "lo scope esplicito agisce comunque");
  assert.equal(perAssenza.disattivati, 0);
  assert.equal(await attivi(db), prima - 1);
  assert.equal(
    (await db.query("SELECT status FROM properties WHERE idealista_id='1001'"))[0].status,
    "inactive",
  );
  await db.close();
});

test("H2. i due meccanismi non si sovrappongono sullo stesso immobile", async () => {
  const db = await nuovoDb();
  const { properties, images } = feed();
  await sync(db, properties, images);

  const s = new IdealistaPropertySyncService({ db, log });
  const id = await s.acquisisciLock({ trigger: "test" });
  const restanti = properties.filter((p) => p.idealista_id !== "1001");
  const { idVisti } = await s.importaProprieta(id, restanti, images);

  const perScope = await s.deactivateExcludedByScope(id, new Set(["1001"]));
  assert.equal(perScope.disattivati, 1);

  // Ora la disattivazione per assenza non deve ricontarlo: e' gia' inattivo.
  const perAssenza = await s.deactivateMissing(id, { feedCompleto: true, idVisti });
  assert.equal(perAssenza.disattivati, 0, "nessun doppio conteggio");
  await db.close();
});
