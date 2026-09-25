/**
 * Ciclo di vita di uno scope che cambia nel tempo.
 *
 * E' il caso piu' insidioso dell'integrazione: un annuncio escluso dallo
 * scope NON arriva alla normalizzazione pubblica, quindi senza un
 * tracciamento apposito resterebbe attivo a database per sempre.
 *
 * Meccanica implementata:
 *   1. normalizzaFeed() raccoglie in `esclusiPerScope` gli id PRESENTI nel
 *      feed ma esclusi dallo scope;
 *   2. deactivateExcludedByScope() li disattiva subito;
 *   3. questo percorso NON e' subordinato a --no-deactivate ne' alla cautela
 *      sul feed incompleto, perche' uno scope 2 e' un'istruzione esplicita
 *      della sorgente, non un'assenza da interpretare;
 *   4. se l'annuncio torna a scope 0, l'upsert lo riattiva
 *      (status='active', deactivated_at=NULL).
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
import { creaLogger } from "../logger.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const MIGRAZIONE = readFileSync(join(QUI, "..", "migrations", "0001_idealista.sql"), "utf8");
const logSilenzioso = creaLogger({ livello: "error", scrivi: () => {} });

/** Feed di un solo annuncio, con lo scope richiesto. */
function feedConScope(scope, id = "123") {
  return `<?xml version="1.0" encoding="utf-8"?>
<ads>
  <ad>
    <id>${id}</id>
    <scope>${scope}</scope>
    <externalReference>TR-${id}</externalReference>
    <comments>
      <adComments>
        <propertyComment>Trilocale con vista, zona servita.</propertyComment>
        <language>5</language>
      </adComments>
    </comments>
    <multimedias>
      <pictures>
        <id>5001</id>
        <position>1</position>
        <multimediaPath>https://img4.idealista.it/blur/x/5001.jpg</multimediaPath>
      </pictures>
    </multimedias>
    <prices><byOperation><SALE><price>300000</price></SALE><RENT /></byOperation></prices>
    <property>
      <typology>0</typology>
      <address>
        <streetTypeId>12</streetTypeId>
        <streetName>Roma</streetName>
        <streetNumber>1</streetNumber>
        <addressVisible>0</addressVisible>
        <location>
          <name>Centro</name>
          <zones><zones>
            <LEVEL3><level>3</level><name>Napoli</name></LEVEL3>
            <LEVEL6><level>6</level><name>Napoli</name></LEVEL6>
          </zones></zones>
        </location>
      </address>
      <housing><propertyArea>85</propertyArea><roomNumber>3</roomNumber></housing>
    </property>
    <modification>1758700000000</modification>
    <creation>1750000000000</creation>
    <operations>0</operations>
  </ad>
</ads>`;
}

async function nuovoDb() {
  const db = new SqliteDriver(":memory:");
  await db.apri();
  await db.exec(MIGRAZIONE);
  return db;
}

/**
 * Esegue una sincronizzazione completa su un feed.
 * @param noDeactivate riproduce il flag --no-deactivate della CLI
 */
async function sincronizza(db, xml, { noDeactivate = false } = {}) {
  const s = new IdealistaPropertySyncService({ db, log: logSilenzioso });
  const ads = estraiAnnunci(parseXml(xml));
  const { properties, images, esclusiPerScope, errori } = normalizzaFeed(ads, {
    scopeAmmessi: [0],
  });

  const syncId = await s.acquisisciLock({ trigger: "test" });
  const { stats, idVisti } = await s.importaProprieta(syncId, properties, images);

  // Percorso esplicito: sempre attivo, anche con --no-deactivate.
  const perScope = await s.deactivateExcludedByScope(syncId, esclusiPerScope);

  // Percorso per assenza: disattivabile.
  const perAssenza = noDeactivate
    ? { disattivati: 0, saltato: "--no-deactivate" }
    : await s.deactivateMissing(syncId, {
        feedCompleto: errori.length === 0 && stats.errori.length === 0,
        idVisti,
      });

  await s.completaSync(syncId, { status: "success" });
  return { stats, perScope, perAssenza, pubblicabili: properties.length };
}

/** Stato pubblico come lo vedrebbe l'API (solo attivi). */
async function statoPubblico(db, id) {
  const r = await db.query(
    `SELECT status, deactivated_at, slug FROM properties WHERE idealista_id = ?`,
    [id],
  );
  return r[0] ?? null;
}
async function contaPubblici(db) {
  const r = await db.query(
    `SELECT COUNT(*) AS n FROM properties WHERE status = 'active'`,
  );
  return Number(r[0].n);
}

/* ------------------------------------------------------------------ 0 -> 2 */

test("scope 0 -> 2: l'immobile diventa non pubblico ma NON viene cancellato", async () => {
  const db = await nuovoDb();

  // Sync 1: scope 0 -> creato e pubblico.
  const s1 = await sincronizza(db, feedConScope(0));
  assert.equal(s1.stats.created, 1);
  let stato = await statoPubblico(db, "123");
  assert.equal(stato.status, "active");
  assert.equal(await contaPubblici(db), 1);

  // Sync 2: stesso id, scope 2.
  const s2 = await sincronizza(db, feedConScope(2));
  assert.equal(s2.pubblicabili, 0, "non passa la normalizzazione pubblica");
  assert.equal(s2.perScope.disattivati, 1, "ma viene disattivato esplicitamente");
  assert.deepEqual(s2.perScope.id, ["123"]);

  stato = await statoPubblico(db, "123");
  assert.equal(stato.status, "inactive", "non piu' pubblico");
  assert.ok(stato.deactivated_at, "viene registrato quando");
  assert.equal(await contaPubblici(db), 0, "sparisce dall'elenco pubblico");

  // La riga esiste ancora: nessuna cancellazione.
  const righe = await db.query(`SELECT COUNT(*) AS n FROM properties WHERE idealista_id = '123'`);
  assert.equal(Number(righe[0].n), 1, "la riga NON viene cancellata");

  await db.close();
});

test("scope 0 -> 2 funziona anche con --no-deactivate", async () => {
  const db = await nuovoDb();
  await sincronizza(db, feedConScope(0), { noDeactivate: true });
  assert.equal(await contaPubblici(db), 1);

  // Questo e' il caso che conta: i primi import in produzione girano
  // proprio con --no-deactivate. Uno scope 2 deve comunque sparire.
  const s2 = await sincronizza(db, feedConScope(2), { noDeactivate: true });
  assert.equal(s2.perScope.disattivati, 1);
  assert.equal(s2.perAssenza.disattivati, 0, "il percorso per assenza resta disattivato");
  assert.equal(await contaPubblici(db), 0, "lo scope 2 vince comunque");

  await db.close();
});

test("scope 0 -> 2: le foto restano associate, pronte per un ritorno", async () => {
  const db = await nuovoDb();
  await sincronizza(db, feedConScope(0));
  const prima = await db.query(`SELECT COUNT(*) AS n FROM property_images`);
  assert.equal(Number(prima[0].n), 1);

  await sincronizza(db, feedConScope(2));
  const dopo = await db.query(`SELECT COUNT(*) AS n FROM property_images`);
  assert.equal(Number(dopo[0].n), 1, "le foto non vengono cancellate");

  await db.close();
});

/* -------------------------------------------------------------- 0 -> 2 -> 0 */

test("scope 0 -> 2 -> 0: l'immobile torna pubblico", async () => {
  const db = await nuovoDb();

  await sincronizza(db, feedConScope(0));
  assert.equal((await statoPubblico(db, "123")).status, "active");
  const slugIniziale = (await statoPubblico(db, "123")).slug;

  await sincronizza(db, feedConScope(2));
  assert.equal((await statoPubblico(db, "123")).status, "inactive");

  // idealista lo ripubblica.
  const s3 = await sincronizza(db, feedConScope(0));
  assert.equal(s3.stats.created, 0, "non viene ricreato: e' lo stesso record");
  assert.equal(s3.stats.updated, 1, "viene riattivato con un update");

  const finale = await statoPubblico(db, "123");
  assert.equal(finale.status, "active", "di nuovo pubblico");
  assert.equal(finale.deactivated_at, null, "la data di disattivazione viene azzerata");
  assert.equal(finale.slug, slugIniziale, "l'URL pubblica resta la stessa");
  assert.equal(await contaPubblici(db), 1);

  // Un solo record per tutto il ciclo: nessun duplicato.
  const righe = await db.query(`SELECT COUNT(*) AS n FROM properties`);
  assert.equal(Number(righe[0].n), 1);

  await db.close();
});

test("scope 1 (MICROSITE_PRIVATE) si comporta come scope 2", async () => {
  const db = await nuovoDb();
  await sincronizza(db, feedConScope(0));
  assert.equal(await contaPubblici(db), 1);

  const s2 = await sincronizza(db, feedConScope(1));
  assert.equal(s2.perScope.disattivati, 1);
  assert.equal(await contaPubblici(db), 0, "il microsito privato non e' il sito pubblico");

  await db.close();
});

/* --------------------------------------------------------------- distinzioni */

test("uno scope escluso NON e' trattato come assenza dal feed", async () => {
  const db = await nuovoDb();

  // Due immobili pubblici.
  const due = feedConScope(0).replace(
    "</ads>",
    feedConScope(0, "456").split("<ads>")[1].replace("</ads>", "") + "</ads>",
  );
  await sincronizza(db, due);
  assert.equal(await contaPubblici(db), 2);

  // Ora 123 passa a scope 2 e 456 resta pubblico: la valvola di sicurezza
  // sulla disattivazione di massa NON deve impedire la disattivazione per
  // scope, che e' esplicita.
  const misto = feedConScope(2).replace(
    "</ads>",
    feedConScope(0, "456").split("<ads>")[1].replace("</ads>", "") + "</ads>",
  );
  const s2 = await sincronizza(db, misto);

  assert.equal(s2.perScope.disattivati, 1);
  assert.equal((await statoPubblico(db, "123")).status, "inactive");
  assert.equal((await statoPubblico(db, "456")).status, "active");
  assert.equal(await contaPubblici(db), 1);

  await db.close();
});

test("un immobile gia' inattivo non viene ricontato a ogni sync", async () => {
  const db = await nuovoDb();
  await sincronizza(db, feedConScope(0));
  const primo = await sincronizza(db, feedConScope(2));
  assert.equal(primo.perScope.disattivati, 1);

  const secondo = await sincronizza(db, feedConScope(2));
  assert.equal(secondo.perScope.disattivati, 0, "era gia' inattivo: niente da fare");

  await db.close();
});

test("uno scope 2 mai visto prima non crea alcuna riga", async () => {
  const db = await nuovoDb();
  const esito = await sincronizza(db, feedConScope(2, "999"));
  assert.equal(esito.perScope.disattivati, 0, "non c'era nulla da disattivare");
  const righe = await db.query(`SELECT COUNT(*) AS n FROM properties`);
  assert.equal(Number(righe[0].n), 0, "non viene inserito nulla");
  await db.close();
});
