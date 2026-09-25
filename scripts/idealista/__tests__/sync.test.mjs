/**
 * Test di persistenza e sicurezza (scenari 15-22).
 *
 * Girano su SQLite in memoria con lo SCHEMA REALE: D1 e' SQLite, quindi le
 * query provate qui sono le stesse che gireranno in produzione.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseXml, estraiAnnunci } from "../xml.mjs";
import { normalizzaFeed } from "../normalize.mjs";
import { SqliteDriver } from "../db.mjs";
import { IdealistaPropertySyncService } from "../sync.mjs";
import { creaLogger, proteggi, oscura } from "../logger.mjs";
import { redigi } from "../ftp.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const MIGRAZIONE = readFileSync(join(QUI, "..", "migrations", "0001_idealista.sql"), "utf8");
const XML = readFileSync(join(QUI, "fixtures", "feed-base.xml"), "utf8");

const logSilenzioso = creaLogger({ livello: "error", scrivi: () => {} });

/** DB in memoria con schema applicato. */
async function nuovoDb() {
  const db = new SqliteDriver(":memory:");
  await db.apri();
  await db.exec(MIGRAZIONE);
  return db;
}

function feedNormalizzato(xml = XML) {
  return normalizzaFeed(estraiAnnunci(parseXml(xml)), { scopeAmmessi: [0] });
}

async function servizioSu(db) {
  return new IdealistaPropertySyncService({ db, log: logSilenzioso });
}

async function conta(db, sql, params = []) {
  return Number((await db.query(sql, params))[0]?.n ?? 0);
}

/* 16 ------------------------------------------------------------------ */
test("16. un immobile nuovo viene creato", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  const syncId = await s.acquisisciLock({ trigger: "test" });
  const { stats } = await s.importaProprieta(syncId, properties, images);

  assert.equal(stats.created, properties.length);
  assert.equal(stats.updated, 0);
  assert.equal(await conta(db, "SELECT COUNT(*) n FROM properties"), properties.length);
  await db.close();
});

/* 15 ------------------------------------------------------------------ */
test("15. un immobile esistente viene aggiornato, non duplicato", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  const sync1 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(sync1, properties, images);
  await s.completaSync(sync1, { status: "success" });

  // Il prezzo cambia: deve risultare un update, non un insert.
  const modificate = properties.map((p) =>
    p.idealista_id === "1001" ? { ...p, price: 299000, content_hash: "diverso" } : p,
  );

  const sync2 = await s.acquisisciLock({ trigger: "test" });
  const { stats } = await s.importaProprieta(sync2, modificate, images);

  assert.equal(stats.created, 0, "nessuna creazione al secondo giro");
  assert.equal(stats.updated, 1, "solo l'immobile cambiato viene riscritto");
  assert.equal(stats.unchanged, properties.length - 1);
  assert.equal(await conta(db, "SELECT COUNT(*) n FROM properties"), properties.length);

  const riga = (await db.query("SELECT price FROM properties WHERE idealista_id = '1001'"))[0];
  assert.equal(riga.price, 299000);
  await db.close();
});

test("15b. sincronizzare due volte lo stesso feed non crea duplicati", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  for (let giro = 0; giro < 3; giro++) {
    const id = await s.acquisisciLock({ trigger: "test" });
    await s.importaProprieta(id, properties, images);
    await s.completaSync(id, { status: "success" });
  }

  assert.equal(await conta(db, "SELECT COUNT(*) n FROM properties"), properties.length);
  assert.equal(
    await conta(
      db,
      "SELECT COUNT(*) n FROM (SELECT idealista_id FROM properties GROUP BY idealista_id HAVING COUNT(*) > 1)",
    ),
    0,
    "nessun idealista_id duplicato",
  );
  await db.close();
});

test("15c. lo slug resta stabile anche se cambia la descrizione", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  const sync1 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(sync1, properties, images);
  await s.completaSync(sync1, { status: "success" });
  const slugIniziale = (
    await db.query("SELECT slug FROM properties WHERE idealista_id = '1001'")
  )[0].slug;

  // Cambia zona e descrizione: lo slug calcolato sarebbe diverso.
  const modificate = properties.map((p) =>
    p.idealista_id === "1001"
      ? { ...p, slug: "tutt-altro-slug-1001", description: "nuova", content_hash: "x" }
      : p,
  );
  const sync2 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(sync2, modificate, images);

  const slugFinale = (
    await db.query("SELECT slug FROM properties WHERE idealista_id = '1001'")
  )[0].slug;
  assert.equal(slugFinale, slugIniziale, "l'URL pubblico non deve cambiare");
  await db.close();
});

/* 17 ------------------------------------------------------------------ */
test("17. le immagini sono sincronizzate in modo idempotente", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  const sync1 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(sync1, properties, images);
  await s.completaSync(sync1, { status: "success" });
  const dopoPrimo = await conta(db, "SELECT COUNT(*) n FROM property_images");

  const sync2 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(sync2, properties, images);
  await s.completaSync(sync2, { status: "success" });
  const dopoSecondo = await conta(db, "SELECT COUNT(*) n FROM property_images");

  assert.equal(dopoSecondo, dopoPrimo, "nessuna foto duplicata");
  assert.equal(
    await conta(
      db,
      "SELECT COUNT(*) n FROM (SELECT property_id, idealista_image_id FROM property_images GROUP BY 1,2 HAVING COUNT(*) > 1)",
    ),
    0,
  );
  await db.close();
});

test("17b. le foto sparite dal feed vengono rimosse, l'ordine resta per position", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  const sync1 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(sync1, properties, images);
  await s.completaSync(sync1, { status: "success" });

  const idProp = (
    await db.query("SELECT id FROM properties WHERE idealista_id = '1001'")
  )[0].id;
  assert.equal(await conta(db, "SELECT COUNT(*) n FROM property_images WHERE property_id = ?", [idProp]), 3);

  // Il feed ora manda una sola foto per 1001.
  const ridotte = new Map(images);
  ridotte.set("1001", [images.get("1001")[0]]);

  const sync2 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(sync2, properties, ridotte);

  const rimaste = await db.query(
    "SELECT idealista_image_id, position FROM property_images WHERE property_id = ? ORDER BY position",
    [idProp],
  );
  assert.equal(rimaste.length, 1);
  assert.equal(rimaste[0].idealista_image_id, "90001");
  await db.close();
});

/* 18 ------------------------------------------------------------------ */
test("18. un feed completo disattiva gli immobili assenti (senza cancellarli)", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  const sync1 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(sync1, properties, images);
  await s.completaSync(sync1, { status: "success" });

  // Il feed successivo perde UN immobile su 7: sotto la soglia di sicurezza.
  const ridotto = properties.filter((p) => p.idealista_id !== "1006");
  const sync2 = await s.acquisisciLock({ trigger: "test" });
  const { idVisti } = await s.importaProprieta(sync2, ridotto, images);
  const esito = await s.deactivateMissing(sync2, { feedCompleto: true, idVisti });

  assert.equal(esito.disattivati, 1);
  assert.equal(esito.saltato, null);

  const riga = (
    await db.query("SELECT status, deactivated_at FROM properties WHERE idealista_id = '1006'")
  )[0];
  assert.equal(riga.status, "inactive");
  assert.ok(riga.deactivated_at, "viene registrato quando e' stato disattivato");

  // Nulla e' stato cancellato.
  assert.equal(await conta(db, "SELECT COUNT(*) n FROM properties"), properties.length);
  await db.close();
});

test("18b. un immobile tornato nel feed viene riattivato", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  const s1 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(s1, properties, images);
  await s.completaSync(s1, { status: "success" });

  const ridotto = properties.filter((p) => p.idealista_id !== "1006");
  const s2 = await s.acquisisciLock({ trigger: "test" });
  const r2 = await s.importaProprieta(s2, ridotto, images);
  await s.deactivateMissing(s2, { feedCompleto: true, idVisti: r2.idVisti });
  await s.completaSync(s2, { status: "success" });

  const s3 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(s3, properties, images);

  const riga = (
    await db.query("SELECT status, deactivated_at FROM properties WHERE idealista_id = '1006'")
  )[0];
  assert.equal(riga.status, "active");
  assert.equal(riga.deactivated_at, null);
  await db.close();
});

/* 19 ------------------------------------------------------------------ */
test("19. un feed incompleto NON deve disattivare nulla", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  const sync1 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(sync1, properties, images);
  await s.completaSync(sync1, { status: "success" });

  const sync2 = await s.acquisisciLock({ trigger: "test" });
  const { idVisti } = await s.importaProprieta(sync2, properties.slice(0, 2), images);

  // feedCompleto = false: il download o il parsing non erano affidabili.
  const esito = await s.deactivateMissing(sync2, { feedCompleto: false, idVisti });

  assert.equal(esito.disattivati, 0);
  assert.match(esito.saltato, /non dichiarato completo/);
  assert.equal(
    await conta(db, "SELECT COUNT(*) n FROM properties WHERE status = 'active'"),
    properties.length,
    "tutti restano attivi",
  );
  await db.close();
});

/* 20 ------------------------------------------------------------------ */
test("20. un feed con zero annunci NON deve disattivare in massa", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  const sync1 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(sync1, properties, images);
  await s.completaSync(sync1, { status: "success" });

  const sync2 = await s.acquisisciLock({ trigger: "test" });
  const esito = await s.deactivateMissing(sync2, {
    feedCompleto: true,
    idVisti: new Set(),
  });

  assert.equal(esito.disattivati, 0);
  assert.match(esito.saltato, /non conteneva annunci/);
  assert.equal(
    await conta(db, "SELECT COUNT(*) n FROM properties WHERE status = 'active'"),
    properties.length,
  );
  await db.close();
});

test("20b. una disattivazione di massa oltre soglia viene bloccata", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  const sync1 = await s.acquisisciLock({ trigger: "test" });
  await s.importaProprieta(sync1, properties, images);
  await s.completaSync(sync1, { status: "success" });

  // Il feed contiene un solo immobile su 7: sospetto di file parziale.
  const sync2 = await s.acquisisciLock({ trigger: "test" });
  const { idVisti } = await s.importaProprieta(sync2, properties.slice(0, 1), images);
  const esito = await s.deactivateMissing(sync2, { feedCompleto: true, idVisti });

  assert.equal(esito.disattivati, 0, "meglio non disattivare che svuotare il sito");
  assert.match(esito.saltato, /disattivazione di massa bloccata/);
  await db.close();
});

/* 22 ------------------------------------------------------------------ */
test("22. due sincronizzazioni contemporanee: la seconda viene rifiutata", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);

  const primo = await s.acquisisciLock({ trigger: "test" });
  assert.ok(primo > 0);

  await assert.rejects(
    () => s.acquisisciLock({ trigger: "test" }),
    /gia' in corso/,
    "il secondo tentativo deve fallire",
  );

  // Chiuso il primo, un nuovo run e' di nuovo possibile.
  await s.completaSync(primo, { status: "success" });
  const secondo = await s.acquisisciLock({ trigger: "test" });
  assert.ok(secondo > primo);
  await db.close();
});

test("22b. un lock scaduto viene recuperato e marcato 'aborted'", async () => {
  const db = await nuovoDb();
  const vecchio = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
  await db.run(
    `INSERT INTO idealista_syncs (status, trigger, started_at) VALUES ('running', 'test', ?)`,
    [vecchio],
  );
  const s = await servizioSu(db);

  const nuovoId = await s.acquisisciLock({ trigger: "test", lockTtlMinuti: 60 });
  assert.ok(nuovoId > 0, "il run morto non blocca per sempre");

  const abortiti = await conta(
    db, "SELECT COUNT(*) n FROM idealista_syncs WHERE status = 'aborted'",
  );
  assert.equal(abortiti, 1);
  await db.close();
});

/* 21 ------------------------------------------------------------------ */
test("21. le credenziali non compaiono nei log", () => {
  const righe = [];
  const log = creaLogger({ livello: "debug", scrivi: (r) => righe.push(r) });
  proteggi("SuperSegreta123");

  log.info("connessione FTP", {
    host: "ftp.habitania.com",
    user: "matrice",
    password: "SuperSegreta123",
  });
  log.error("errore con password SuperSegreta123 nel messaggio");

  const tutto = righe.join("\n");
  assert.ok(!tutto.includes("SuperSegreta123"), "la password non deve comparire");
  assert.ok(tutto.includes("***"));
  assert.ok(tutto.includes("ftp.habitania.com"), "il resto del log resta utile");
});

test("21b. gli URL con credenziali vengono redatti", () => {
  const sporco = "curl: ftp://utente:Passw0rd@ftp.habitania.com/feed.xml fallito";
  assert.ok(!oscura(sporco).includes("Passw0rd"));
  assert.ok(oscura(sporco).includes("***:***@"));
});

test("21c. redigi() ripulisce i messaggi d'errore FTP", () => {
  const messaggio = redigi(
    "Access denied for user pippo with password Segreta!",
    "pippo",
    "Segreta!",
  );
  assert.ok(!messaggio.includes("Segreta!"));
  assert.ok(!messaggio.includes("pippo"));
});

test("21d. chiavi sensibili negli oggetti di log vengono mascherate", () => {
  const righe = [];
  const log = creaLogger({ livello: "debug", formato: "json", scrivi: (r) => righe.push(r) });
  log.info("config", { apiToken: "abc123xyz", account: "pubblico" });
  const riga = JSON.parse(righe[0]);
  assert.equal(riga.dati.apiToken, "***");
  assert.equal(riga.dati.account, "pubblico");
});

/* statistiche ---------------------------------------------------------- */
test("il registro dei sync riporta le statistiche", async () => {
  const db = await nuovoDb();
  const s = await servizioSu(db);
  const { properties, images } = feedNormalizzato();

  const syncId = await s.acquisisciLock({ trigger: "scheduled" });
  const { stats } = await s.importaProprieta(syncId, properties, images);
  await s.completaSync(syncId, {
    status: "success",
    sourceFilename: "feed-base.xml",
    sourceBytes: 1234,
    received: 8,
    created: stats.created,
    updated: stats.updated,
    unchanged: stats.unchanged,
    skipped: 1,
    deactivated: 0,
    imagesSynced: stats.imagesSynced,
    durationMs: 250,
  });

  const riga = (await db.query("SELECT * FROM idealista_syncs WHERE id = ?", [syncId]))[0];
  assert.equal(riga.status, "success");
  assert.equal(riga.trigger, "scheduled");
  assert.equal(riga.source_filename, "feed-base.xml");
  assert.equal(riga.records_received, 8);
  assert.equal(riga.records_created, properties.length);
  assert.equal(riga.records_skipped, 1);
  assert.ok(riga.completed_at);
  await db.close();
});
