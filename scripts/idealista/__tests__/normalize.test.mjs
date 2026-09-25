/**
 * Test di parsing e normalizzazione (scenari 1-14).
 * Esecuzione: node --test scripts/idealista/__tests__/
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseXml, estraiAnnunci } from "../xml.mjs";
import { normalizzaFeed, normalizzaAnnuncio, scegliDescrizione, slugify } from "../normalize.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const XML = readFileSync(join(QUI, "fixtures", "feed-base.xml"), "utf8");

const ANNUNCI = estraiAnnunci(parseXml(XML));
const FEED = normalizzaFeed(ANNUNCI, { scopeAmmessi: [0] });

/** Immobile per id idealista. */
function perId(id) {
  return FEED.properties.find((p) => p.idealista_id === id);
}
function immaginiDi(id) {
  return FEED.images.get(id) ?? [];
}

test("il feed viene letto e gli annunci estratti", () => {
  assert.equal(ANNUNCI.length, 8);
  assert.equal(FEED.errori.length, 0, "nessun errore di normalizzazione");
});

/* 1 ------------------------------------------------------------------- */
test("1. residenziale in vendita normalizzato correttamente", () => {
  const p = perId("1001");
  assert.ok(p, "immobile 1001 presente");
  assert.equal(p.operation, "sale");
  assert.equal(p.price, 285000);
  assert.equal(p.property_type, "HOME");
  assert.equal(p.property_type_label, "Appartamento");
  assert.equal(p.property_area, 95);
  assert.equal(p.usable_area, 88);
  assert.equal(p.rooms, 3);
  assert.equal(p.bathrooms, 2);
  assert.equal(p.floor, 3);
  assert.equal(p.construction_year, 1920);
  assert.equal(p.energy_certification, "C", "certification 8 = C");
  assert.equal(p.is_commercial, 0);
  assert.equal(p.is_industrial, 0);
});

/* 2 ------------------------------------------------------------------- */
test("2. annuncio in affitto: operazione e prezzo dal nodo RENT", () => {
  const p = perId("1002");
  assert.equal(p.operation, "rent");
  assert.equal(p.price, 1250);
  assert.equal(p.deposit, "Due mensilita");
});

/* 3 ------------------------------------------------------------------- */
test("3. villa/chalet: tipologia e sottotipo", () => {
  const p = perId("1003");
  assert.equal(p.property_type, "CHALET");
  assert.equal(p.property_type_label, "Villa");
  assert.equal(p.property_subtype, "Villa");
  assert.equal(p.plot_area, 800);
  assert.equal(p.has_swimming_pool, 1);
  assert.equal(p.has_garden, 1);
});

/* 4 ------------------------------------------------------------------- */
test("4. capannone industriale: dati letti da trading/warehouse", () => {
  const p = perId("1004");
  assert.equal(p.property_type, "WAREHOUSE");
  assert.equal(p.property_area, 1800, "superficie presa da trading, non da housing");
  assert.equal(p.usable_area, 1650);
  assert.equal(p.bathrooms, 4);
  assert.equal(p.construction_year, 2010);
  assert.equal(p.is_industrial, 1);
  const dotazioni = JSON.parse(p.features_json);
  assert.ok(dotazioni.includes("Banchina di carico"));
  assert.ok(dotazioni.includes("Parcheggio esterno"));
  assert.ok(dotazioni.includes("Riscaldamento"));
});

test("4b. ufficio: dati letti da trading/office", () => {
  const p = perId("1008");
  assert.equal(p.property_type, "OFFICE");
  assert.equal(p.property_area, 320);
  assert.equal(p.building_floors, 8);
  assert.equal(p.is_commercial, 1);
  assert.equal(p.operation, "rent");
  assert.equal(p.price, 3200);
});

/* 5 ------------------------------------------------------------------- */
test("5. descrizione italiana preferita quando presente", () => {
  const p = perId("1001");
  assert.equal(p.description_language, "ITALIAN");
  assert.equal(p.description_is_fallback, 0);
  assert.match(p.description, /Trilocale ristrutturato/);
  assert.doesNotMatch(p.description, /Refurbished/, "le lingue non vengono concatenate");
});

/* 6 ------------------------------------------------------------------- */
test("6. ripiego sull'inglese quando manca l'italiano", () => {
  const p = perId("1002");
  assert.equal(p.description_language, "ENGLISH");
  assert.equal(p.description_is_fallback, 1);
  assert.match(p.description, /Bright two-room/);
});

test("6b. tutte le lingue restano disponibili separatamente", () => {
  const tutte = JSON.parse(perId("1001").descriptions_json);
  assert.deepEqual(Object.keys(tutte).sort(), ["ENGLISH", "ITALIAN"]);
});

/* 7 ------------------------------------------------------------------- */
test("7. descrizione assente non rompe la normalizzazione", () => {
  const p = perId("1003");
  assert.equal(p.description, null);
  assert.equal(p.description_language, null);
  assert.ok(p.title, "il titolo viene comunque generato");
});

test("7b. scegliDescrizione su nodo vuoto", () => {
  const r = scegliDescrizione(undefined);
  assert.deepEqual(r, { testo: null, lingua: null, ripiego: false, tutte: {} });
});

/* 8 ------------------------------------------------------------------- */
test("8. immagini ordinate per position, non per ordine nel file", () => {
  const img = immaginiDi("1001");
  assert.equal(img.length, 3);
  assert.deepEqual(img.map((i) => i.position), [1, 2, 3]);
  assert.deepEqual(img.map((i) => i.idealista_image_id), ["90001", "90002", "90003"]);
  assert.equal(img[0].tag, "VIEWS", "la prima diventa la copertina");
});

/* 9 ------------------------------------------------------------------- */
test("9. immagini assenti: elenco vuoto, nessun errore", () => {
  assert.deepEqual(immaginiDi("1003"), []);
  assert.equal(perId("1003").images_count, 0);
});

/* 10-12 --------------------------------------------------------------- */
test("10. prezzo di vendita letto da SALE", () => {
  assert.equal(perId("1001").price, 285000);
  assert.equal(perId("1001").price_on_application, 0);
});

test("11. prezzo d'affitto letto da RENT quando SALE e' vuoto", () => {
  assert.equal(perId("1002").price, 1250);
  assert.equal(perId("1002").operation, "rent");
});

test("12. prezzo assente: price null e price_on_application attivo", () => {
  const p = perId("1006");
  assert.equal(p.price, null);
  assert.equal(p.price_on_application, 1);
  assert.ok(p, "l'annuncio viene comunque importato");
});

/* 13 ------------------------------------------------------------------ */
test("13a. SHOW_ADDRESS espone via e civico", () => {
  const p = perId("1001");
  assert.equal(p.address_visibility, "SHOW_ADDRESS");
  assert.equal(p.street_public, "Via Toledo");
  assert.equal(p.street_number_public, "265");
  assert.equal(p.coordinates_public, 1);
});

test("13b. ONLY_STREET_NAME espone la via ma non il civico", () => {
  const p = perId("1008");
  assert.equal(p.address_visibility, "ONLY_STREET_NAME");
  assert.equal(p.street_public, "Via Medina");
  assert.equal(p.street_number_public, null, "il civico non deve uscire");
  assert.equal(p.coordinates_public, 1);
});

test("13c. HIDDEN_ADDRESS non espone nulla, coordinate comprese", () => {
  const p = perId("1005");
  assert.equal(p.address_visibility, "HIDDEN_ADDRESS");
  assert.equal(p.street_public, null);
  assert.equal(p.street_number_public, null);
  assert.equal(p.postal_code, null);
  assert.equal(
    p.coordinates_public, 0,
    "una mappa rivelerebbe comunque la posizione esatta",
  );
  // I valori restano per uso interno, ma non sono pubblici.
  assert.equal(p.street, "Via Riservata");
  assert.equal(typeof p.latitude, "number");
});

test("13d. addressVisible assente viene trattato come nascosto", () => {
  const esito = normalizzaAnnuncio(
    { id: "9", scope: "0", property: { address: { streetName: "X" } } },
    { scopeAmmessi: [0] },
  );
  assert.equal(esito.property.address_visibility, "HIDDEN_ADDRESS");
  assert.equal(esito.property.street_public, null);
});

/* 14 ------------------------------------------------------------------ */
test("14. coordinate geografiche lette e validate", () => {
  const p = perId("1001");
  assert.equal(p.latitude, 40.8419);
  assert.equal(p.longitude, 14.2487);
  assert.equal(p.city, "Napoli");
  assert.equal(p.province, "Napoli");
  assert.equal(p.zone, "Centro Storico");
  assert.equal(p.district, "Montecalvario");
  assert.equal(p.country, "Italia");
});

test("14b. coordinate fuori intervallo vengono scartate", () => {
  const esito = normalizzaAnnuncio(
    {
      id: "10", scope: "0",
      property: {
        address: {
          addressVisible: "0",
          coordinates: { latitude: "999", longitude: "500" },
        },
      },
    },
    { scopeAmmessi: [0] },
  );
  assert.equal(esito.property.latitude, null);
  assert.equal(esito.property.coordinates_public, 0);
});

/* scope ---------------------------------------------------------------- */
test("scope diverso da 0 viene sempre scartato", () => {
  assert.equal(perId("1007"), undefined, "1007 ha scope 2 e non deve entrare");
  assert.ok(Object.keys(FEED.scarti).some((k) => k.includes("NOT_PUBLISHED")));
});

/* robustezza ----------------------------------------------------------- */
test("annuncio senza id viene scartato senza eccezione", () => {
  const esito = normalizzaAnnuncio({ scope: "0" }, { scopeAmmessi: [0] });
  assert.equal(esito.scartato, "annuncio senza id");
});

test("campi opzionali mancanti non fanno fallire la normalizzazione", () => {
  const esito = normalizzaAnnuncio({ id: "11", scope: "0" }, { scopeAmmessi: [0] });
  assert.ok(esito.property, "l'immobile viene comunque prodotto");
  assert.equal(esito.property.property_area, null);
  assert.equal(esito.property.rooms, null);
});

test("un annuncio malformato non interrompe l'intero feed", () => {
  const misti = [...ANNUNCI, { id: "bad", scope: "0", property: { typology: "non-un-numero" } }];
  const r = normalizzaFeed(misti, { scopeAmmessi: [0] });
  assert.ok(r.properties.length >= FEED.properties.length);
});

test("enum sconosciuto conserva il grezzo senza corrompere il dato", () => {
  const esito = normalizzaAnnuncio(
    { id: "12", scope: "0", property: { typology: "999" } },
    { scopeAmmessi: [0] },
  );
  assert.equal(esito.property.property_type, null, "chiave nulla, non inventata");
  assert.equal(esito.property.property_type_raw, 999, "il grezzo resta per il debug");
});

/* slug ----------------------------------------------------------------- */
test("gli slug sono unici e contengono l'id", () => {
  const slug = FEED.properties.map((p) => p.slug);
  assert.equal(new Set(slug).size, slug.length);
  for (const p of FEED.properties) {
    assert.ok(p.slug.endsWith(p.idealista_id), `${p.slug} termina con l'id`);
  }
});

test("slugify produce stringhe sicure per URL", () => {
  assert.equal(slugify("Villa à Posillipo, 100% "), "villa-a-posillipo-100");
  assert.equal(slugify("---"), "");
});

/* timestamp ------------------------------------------------------------ */
test("creation/modification convertiti da millisecondi UTC", () => {
  const p = perId("1001");
  assert.equal(p.source_modified_at, new Date(1758700000000).toISOString());
  assert.equal(p.source_created_at, new Date(1750000000000).toISOString());
});

test("timestamp assurdi vengono ignorati", () => {
  const esito = normalizzaAnnuncio(
    { id: "13", scope: "0", modification: "1", creation: "99999999999999" },
    { scopeAmmessi: [0] },
  );
  assert.equal(esito.property.source_modified_at, null);
  assert.equal(esito.property.source_created_at, null);
});

/* impronta ------------------------------------------------------------- */
test("content_hash e' stabile fra due normalizzazioni identiche", () => {
  const a = normalizzaFeed(ANNUNCI, { scopeAmmessi: [0] });
  const b = normalizzaFeed(ANNUNCI, { scopeAmmessi: [0] });
  for (let i = 0; i < a.properties.length; i++) {
    assert.equal(a.properties[i].content_hash, b.properties[i].content_hash);
  }
});
