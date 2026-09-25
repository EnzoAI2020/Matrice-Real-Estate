/**
 * Test di compatibilita' del driver D1.
 *
 * Il driver REST non e' esercitabile contro D1 vero senza credenziali, quindi
 * qui si intercetta fetch e si controlla ESATTAMENTE l'SQL che verrebbe
 * inviato. Serve a impedire la regressione del difetto trovato in audit:
 * l'endpoint /query di D1 NON accetta BEGIN/COMMIT espliciti.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { D1RestDriver, SqliteDriver } from "../db.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const MIGRAZIONE = readFileSync(join(QUI, "..", "migrations", "0001_idealista.sql"), "utf8");

/** Driver D1 con fetch finto: raccoglie le richieste invece di inviarle. */
function driverIntercettato() {
  const inviati = [];
  const originale = globalThis.fetch;

  globalThis.fetch = async (_url, opzioni) => {
    const corpo = JSON.parse(opzioni.body);
    inviati.push({ sql: corpo.sql, params: corpo.params, headers: opzioni.headers });
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, result: [{ results: [], meta: {} }] }),
    };
  };

  const driver = new D1RestDriver({
    accountId: "acc",
    databaseId: "db",
    apiToken: "token-segretissimo",
  });

  return { driver, inviati, ripristina: () => { globalThis.fetch = originale; } };
}

test("batch() non invia BEGIN/COMMIT: D1 non li accetta", async () => {
  const { driver, inviati, ripristina } = driverIntercettato();
  try {
    await driver.batch([
      { sql: "INSERT INTO property_images (url) VALUES (?)", params: ["https://x/1.jpg"] },
      { sql: "DELETE FROM property_images WHERE id = ?", params: [7] },
    ]);
  } finally {
    ripristina();
  }

  const tuttoSql = inviati.map((i) => i.sql).join(" ").toUpperCase();
  assert.ok(!/\bBEGIN\b/.test(tuttoSql), "nessun BEGIN esplicito");
  assert.ok(!/\bCOMMIT\b/.test(tuttoSql), "nessun COMMIT esplicito");
  assert.ok(!/\bROLLBACK\b/.test(tuttoSql), "nessun ROLLBACK esplicito");
});

test("batch() manda ogni statement PARAMETRIZZATO, senza interpolare i valori", async () => {
  const { driver, inviati, ripristina } = driverIntercettato();
  const malevolo = "Villa 'a mare' \" ; DROP TABLE properties; --";
  try {
    await driver.batch([
      {
        sql: "INSERT INTO properties (title, price, status) VALUES (?, ?, ?)",
        params: [malevolo, 250000, null],
      },
    ]);
  } finally {
    ripristina();
  }

  assert.equal(inviati.length, 1);
  const { sql, params } = inviati[0];

  // Il valore NON deve comparire nell'SQL: viaggia nei parametri.
  assert.ok(!sql.includes("DROP TABLE"), "il testo malevolo non entra nell'SQL");
  assert.ok(!sql.includes("a mare"), "nessun valore interpolato");
  assert.ok(sql.includes("VALUES (?, ?, ?)"), "i segnaposto restano tali");
  assert.deepEqual(params, [malevolo, 250000, null], "i valori viaggiano a parte");
});

test("testo Unicode e apostrofi passano intatti come parametri", async () => {
  const { driver, inviati, ripristina } = driverIntercettato();
  const cinese = "阿尔扎诺 (Arzano) D7 工业园区厂房出租";
  const italiano = "Trilocale all'ultimo piano, vista sull'intero golfo — 95 m²";
  try {
    await driver.query("SELECT * FROM properties WHERE description = ? OR title = ?", [
      cinese,
      italiano,
    ]);
  } finally {
    ripristina();
  }

  assert.deepEqual(inviati[0].params, [cinese, italiano]);
  assert.ok(!inviati[0].sql.includes("阿尔扎诺"));
  assert.ok(!inviati[0].sql.includes("all'ultimo"));
});

test("booleani e undefined sono normalizzati per SQLite/D1", async () => {
  const { driver, inviati, ripristina } = driverIntercettato();
  try {
    await driver.query("SELECT ?, ?, ?", [true, false, undefined]);
  } finally {
    ripristina();
  }
  assert.deepEqual(inviati[0].params, [1, 0, null]);
});

test("il token non compare mai nel corpo della richiesta", async () => {
  const { driver, inviati, ripristina } = driverIntercettato();
  try {
    await driver.query("SELECT 1");
  } finally {
    ripristina();
  }
  assert.ok(!inviati[0].sql.includes("token-segretissimo"));
  assert.ok(!JSON.stringify(inviati[0].params ?? []).includes("token-segretissimo"));
  // Viaggia solo nell'header Authorization, come deve.
  assert.match(inviati[0].headers.Authorization, /^Bearer /);
});

test("configurazione D1 incompleta fallisce subito e senza segreti", () => {
  assert.throws(
    () => new D1RestDriver({ accountId: "", databaseId: "", apiToken: "" }),
    (e) => {
      assert.match(e.message, /CLOUDFLARE_ACCOUNT_ID/);
      assert.ok(!/token|password/i.test(e.message.replace(/CLOUDFLARE_API_TOKEN/g, "")));
      return true;
    },
  );
});

/* --------------------------------------------- compatibilita' dello schema */

test("lo schema non usa costrutti fuori dal sottoinsieme SQLite di D1", () => {
  const vietati = [
    [/\bWITHOUT\s+ROWID\b/i, "WITHOUT ROWID"],
    [/\bGENERATED\s+ALWAYS\b/i, "colonne generate"],
    [/\bATTACH\b/i, "ATTACH"],
    [/\bPRAGMA\b/i, "PRAGMA (non ammesso via API D1)"],
    [/\bCREATE\s+TRIGGER\b/i, "trigger"],
    [/\bCREATE\s+VIEW\b/i, "viste"],
    [/\bAUTOINCREMENT\b.*\bWITHOUT\b/i, "AUTOINCREMENT su tabella senza rowid"],
  ];
  for (const [regex, nome] of vietati) {
    assert.ok(!regex.test(MIGRAZIONE), `lo schema non deve usare ${nome}`);
  }
});

test("lo schema si applica davvero su SQLite", async () => {
  const db = new SqliteDriver(":memory:");
  await db.apri();
  await db.exec(MIGRAZIONE);

  const tabelle = await db.query(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  assert.deepEqual(
    tabelle.map((t) => t.name),
    ["idealista_syncs", "properties", "property_images"],
  );

  const indici = await db.query(
    "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'",
  );
  assert.ok(indici.length >= 10, "gli indici vengono creati");
  await db.close();
});

test("la migrazione e' rieseguibile senza errori (IF NOT EXISTS)", async () => {
  const db = new SqliteDriver(":memory:");
  await db.apri();
  await db.exec(MIGRAZIONE);
  await db.exec(MIGRAZIONE); // seconda volta: non deve lanciare
  await db.close();
});

test("il vincolo di unicita' impedisce due volte lo stesso idealista_id", async () => {
  const db = new SqliteDriver(":memory:");
  await db.apri();
  await db.exec(MIGRAZIONE);
  const adesso = new Date().toISOString();

  await db.run(
    `INSERT INTO properties (source, idealista_id, slug, created_at, updated_at)
     VALUES ('idealista', '999', 'slug-999', ?, ?)`,
    [adesso, adesso],
  );

  await assert.rejects(
    () =>
      db.run(
        `INSERT INTO properties (source, idealista_id, slug, created_at, updated_at)
         VALUES ('idealista', '999', 'slug-diverso', ?, ?)`,
        [adesso, adesso],
      ),
    /UNIQUE/i,
    "il database stesso rifiuta il duplicato",
  );
  await db.close();
});

test("ON DELETE CASCADE rimuove le foto dell'immobile cancellato", async () => {
  const db = new SqliteDriver(":memory:");
  await db.apri();
  await db.exec(MIGRAZIONE);
  const adesso = new Date().toISOString();

  const p = await db.run(
    `INSERT INTO properties (source, idealista_id, slug, created_at, updated_at)
     VALUES ('idealista', '1', 'x', ?, ?)`,
    [adesso, adesso],
  );
  await db.run(
    `INSERT INTO property_images (property_id, idealista_image_id, url, position, created_at, updated_at)
     VALUES (?, 'i1', 'https://x/1.jpg', 1, ?, ?)`,
    [p.lastInsertRowid, adesso, adesso],
  );

  await db.run(`DELETE FROM properties WHERE id = ?`, [p.lastInsertRowid]);
  const rimaste = await db.query(`SELECT COUNT(*) AS n FROM property_images`);
  assert.equal(Number(rimaste[0].n), 0);
  await db.close();
});

/* ------------------------------------- limite parametri di D1 (max 100) --- */

/**
 * D1 accetta al massimo 100 parametri legati per statement (verificato:
 * 100 passa, 101 -> "too many SQL variables"). SQLite locale ne accetta
 * 32766, quindi questo limite NON emerge dai test su SQLite: va controllato
 * contando i parametri che il sync genera davvero.
 */
const LIMITE_D1 = 100;

/** Driver finto che registra ogni statement con il suo numero di parametri. */
function driverContatore() {
  const visti = [];
  return {
    visti,
    async query(sql, params = []) {
      visti.push({ sql, n: params.length });
      return [];
    },
    async run(sql, params = []) {
      visti.push({ sql, n: params.length });
      return { changes: 1, lastInsertRowid: 1 };
    },
    async batch(statements) {
      for (const s of statements) visti.push({ sql: s.sql, n: (s.params ?? []).length });
    },
    async exec() {},
    async close() {},
  };
}

test("syncImages resta entro il limite di parametri di D1 anche con 40 foto", async () => {
  const { IdealistaPropertySyncService } = await import("../sync.mjs");
  const db = driverContatore();
  const servizio = new IdealistaPropertySyncService({
    db,
    log: { info() {}, warn() {}, error() {}, debug() {} },
  });

  // 40 foto: e' il massimo presente nel feed reale di Matrice.
  const immagini = Array.from({ length: 40 }, (_, i) => ({
    idealista_image_id: `img-${i}`,
    tag: "VIEWS",
    url: `https://img4.idealista.it/blur/x/${i}.jpg`,
    position: i + 1,
    width: 1500,
    height: 1000,
  }));

  await servizio.syncImages(7, immagini);

  const sforati = db.visti.filter((s) => s.n > LIMITE_D1);
  assert.deepEqual(
    sforati.map((s) => s.n),
    [],
    `nessuno statement deve superare ${LIMITE_D1} parametri`,
  );
  assert.ok(db.visti.length >= 4, "le foto vengono spezzate in piu' lotti");
});

test("syncImages con 200 foto (massimo del formato) resta entro il limite", async () => {
  const { IdealistaPropertySyncService } = await import("../sync.mjs");
  const db = driverContatore();
  const servizio = new IdealistaPropertySyncService({
    db,
    log: { info() {}, warn() {}, error() {}, debug() {} },
  });

  const immagini = Array.from({ length: 200 }, (_, i) => ({
    idealista_image_id: `i${i}`, tag: null, url: `https://x/${i}.jpg`,
    position: i + 1, width: null, height: null,
  }));

  await servizio.syncImages(1, immagini);
  const massimo = Math.max(...db.visti.map((s) => s.n));
  assert.ok(massimo <= LIMITE_D1, `massimo osservato ${massimo}, limite ${LIMITE_D1}`);
});

test("la cancellazione delle foto sparite non usa una lista IN parametrizzata", async () => {
  const { IdealistaPropertySyncService } = await import("../sync.mjs");
  const db = driverContatore();
  const servizio = new IdealistaPropertySyncService({
    db,
    log: { info() {}, warn() {}, error() {}, debug() {} },
  });

  const immagini = Array.from({ length: 50 }, (_, i) => ({
    idealista_image_id: `i${i}`, tag: null, url: `https://x/${i}.jpg`,
    position: i + 1, width: null, height: null,
  }));
  await servizio.syncImages(1, immagini);

  const delete_ = db.visti.find((s) => /^\s*DELETE FROM property_images/.test(s.sql));
  assert.ok(delete_, "la DELETE esiste");
  assert.ok(!/ IN \(/.test(delete_.sql), "niente lista IN: non scalerebbe");
  assert.ok(delete_.n <= 3, "pochi parametri fissi, indipendenti dal numero di foto");
});

test("l'upsert di un immobile resta entro il limite di parametri", async () => {
  const { IdealistaPropertySyncService } = await import("../sync.mjs");
  const db = {
    ...driverContatore(),
  };
  const visti = [];
  db.query = async (sql, params = []) => { visti.push(params.length); return []; };
  db.run = async (sql, params = []) => { visti.push(params.length); return { changes: 1, lastInsertRowid: 1 }; };

  const servizio = new IdealistaPropertySyncService({
    db, log: { info() {}, warn() {}, error() {}, debug() {} },
  });

  await servizio.upsertProperty(
    { source: "idealista", idealista_id: "1", slug: "s", content_hash: "h" },
    1,
  );
  const massimo = Math.max(...visti);
  assert.ok(massimo <= LIMITE_D1, `massimo osservato ${massimo}, limite ${LIMITE_D1}`);
});
