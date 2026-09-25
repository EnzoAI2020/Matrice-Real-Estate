/**
 * Da annuncio grezzo idealista a record normalizzato, pronto per il database.
 *
 * Qui stanno le regole che contano:
 *   - scope           : quali annunci e' lecito pubblicare
 *   - addressVisible  : quanto indirizzo si puo' mostrare al pubblico
 *   - lingua          : quale descrizione scegliere fra quelle inviate
 *   - residenziale / commerciale : da quale sottoalbero leggere i dati
 *
 * Il normalizzatore non tocca il database e non fa I/O: e' una funzione pura,
 * cosi' e' interamente testabile su fixture.
 */

import { createHash } from "node:crypto";

import { toArray, str, num, int, bool, primo } from "./xml.mjs";
import * as E from "./enums.mjs";

/* ------------------------------------------------------------- utilita' */

export function slugify(testo) {
  return String(testo)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

/** <creation>/<modification> sono long in millisecondi UTC. */
function isoDaMillisecondi(valore) {
  const n = num(valore);
  if (n === null || n <= 0) return null;
  const d = new Date(n);
  if (Number.isNaN(d.getTime())) return null;
  // Scarta date assurde: proteggono da valori corrotti nel feed.
  const anno = d.getUTCFullYear();
  if (anno < 1990 || anno > 2100) return null;
  return d.toISOString();
}

/** true/false -> 1/0 per SQLite; null resta null. */
export function sqlBool(v) {
  if (v === null || v === undefined) return null;
  return v ? 1 : 0;
}

/* ---------------------------------------------------------- geografia */

/**
 * Il feed manda i livelli come { level, name }. I codici gerarchici
 * (0-EU-IT-...) non sono garantiti, quindi si usano i nomi e le coordinate,
 * come raccomanda idealista stessa. Si leggono solo i livelli utili al sito:
 * nessuna dipendenza fragile da tutti i nodi annidati.
 */
function leggiZone(indirizzo) {
  const zone = indirizzo?.location?.zones?.zones ?? {};
  const nome = (livello) => str(zone[`LEVEL${livello}`]?.name);
  return {
    paese: nome(2),
    provincia: nome(3),
    comune: nome(6) ?? nome(5) ?? nome(4),
    zona: nome(7),
    quartiere: nome(8),
  };
}

function localitaBreve(zone, indirizzo) {
  return (
    zone.quartiere ??
    zone.zona ??
    str(indirizzo?.location?.name) ??
    zone.comune ??
    zone.provincia ??
    null
  );
}

/* -------------------------------------------------------- indirizzo */

/**
 * Applica addressVisible. E' una istruzione del venditore, non un
 * suggerimento: con HIDDEN_ADDRESS spariscono via, civico E coordinate
 * pubbliche, perche' una mappa rivelerebbe comunque la posizione esatta.
 *
 * I valori esatti restano nei campi non pubblici (street, latitude,
 * longitude) per uso interno; l'API e le pagine leggono solo i *_public.
 */
function componiIndirizzo(indirizzo, zone) {
  const vis = E.decode(E.ADDRESS_VISIBILITY_KEYS, null, indirizzo?.addressVisible);
  // In assenza del campo si assume il piu' restrittivo.
  const chiave = vis.key ?? "HIDDEN_ADDRESS";

  const tipoStrada = E.STREET_TYPE[int(indirizzo?.streetTypeId) ?? -1] ?? "";
  const nomeStrada = str(indirizzo?.streetName);
  const civicoNum = int(indirizzo?.streetNumber);
  const civico = civicoNum !== null && civicoNum > 0 ? String(civicoNum) : null;

  const viaCompleta = nomeStrada
    ? [tipoStrada, nomeStrada].filter(Boolean).join(" ").trim()
    : null;

  let viaPubblica = null;
  let civicoPubblico = null;
  if (chiave === "SHOW_ADDRESS") {
    viaPubblica = viaCompleta;
    civicoPubblico = civico;
  } else if (chiave === "ONLY_STREET_NAME") {
    viaPubblica = viaCompleta;
  }

  const lat = num(indirizzo?.coordinates?.latitude);
  const lng = num(indirizzo?.coordinates?.longitude);
  const coordinateValide =
    lat !== null && lng !== null &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  return {
    address_visibility: chiave,
    street: viaCompleta,
    street_number: civico,
    street_public: viaPubblica,
    street_number_public: civicoPubblico,
    postal_code: chiave === "HIDDEN_ADDRESS" ? null : str(indirizzo?.postalCode),
    city: zone.comune,
    province: zone.provincia,
    zone: zone.zona,
    district: zone.quartiere,
    country: zone.paese,
    latitude: coordinateValide ? lat : null,
    longitude: coordinateValide ? lng : null,
    coordinates_public: sqlBool(coordinateValide && chiave !== "HIDDEN_ADDRESS"),
    floor: int(indirizzo?.floorNumber),
  };
}

/* ------------------------------------------------------- descrizione */

/**
 * Sceglie UNA descrizione: l'italiana se c'e', altrimenti il primo ripiego
 * disponibile. Non concatena mai le lingue. Conserva comunque tutte le
 * versioni ricevute in descriptions_json.
 */
export function scegliDescrizione(commenti) {
  const voci = toArray(commenti?.adComments)
    .map((c) => ({ lingua: int(c?.language), testo: str(c?.propertyComment) }))
    .filter((c) => c.testo !== null);

  const tutte = {};
  for (const v of voci) {
    const k = E.key(E.LINGUA_KEYS, v.lingua) ?? `LANG_${v.lingua ?? "NA"}`;
    if (!tutte[k]) tutte[k] = v.testo;
  }

  if (voci.length === 0) {
    return { testo: null, lingua: null, ripiego: false, tutte };
  }

  for (const preferita of E.LINGUA_FALLBACK) {
    const trovata = voci.find((v) => v.lingua === preferita);
    if (trovata) {
      return {
        testo: trovata.testo,
        lingua: E.key(E.LINGUA_KEYS, trovata.lingua),
        ripiego: preferita !== E.LINGUA_ITALIANO,
        tutte,
      };
    }
  }
  // Nessuna lingua nota: si prende la prima disponibile, segnalata come ripiego.
  return {
    testo: voci[0].testo,
    lingua: E.key(E.LINGUA_KEYS, voci[0].lingua),
    ripiego: true,
    tutte,
  };
}

/* -------------------------------------------------- dati per tipologia */

/**
 * Sceglie il sottoalbero giusto secondo la tipologia. Il feed puo' portare
 * dati residenziali sotto housing e dati commerciali/industriali sotto
 * trading (con office/warehouse annidati) o land: leggerli tutti con un
 * ripiego ordinato evita di assumere che ogni immobile sia un appartamento.
 */
function leggiCaratteristiche(proprieta, tipologiaKey) {
  const housing = proprieta?.housing ?? {};
  const trading = proprieta?.trading ?? {};
  const office = trading?.office ?? {};
  const warehouse = trading?.warehouse ?? {};
  const land = proprieta?.land ?? {};
  const building = proprieta?.building ?? {};
  const storage = proprieta?.storageRoom ?? {};

  const commerciale = bool(warehouse?.IsCommercial) === true;
  const industriale = bool(warehouse?.IsIndustrial) === true;

  return {
    property_area: primo(
      num(housing?.propertyArea),
      num(trading?.propertyArea),
      num(land?.propertyArea),
      num(building?.propertyArea),
      num(storage?.propertyArea),
    ),
    usable_area: primo(num(housing?.usableArea), num(trading?.usableArea)),
    plot_area: primo(num(housing?.plotOfLand), num(land?.buildingSurface)),
    rooms: int(housing?.roomNumber),
    bedrooms: int(housing?.bedroomNumber),
    bathrooms: primo(int(housing?.bathNumber), int(trading?.bathNumber)),
    building_floors: primo(
      int(housing?.buildingFloors),
      int(office?.buildingFloors),
      int(building?.buildingFloors),
    ),
    construction_year: primo(
      int(housing?.constructionYear),
      int(trading?.constructionYear),
      int(building?.constructionYear),
    ),
    is_commercial: sqlBool(
      commerciale || tipologiaKey === "WAREHOUSE" || tipologiaKey === "OFFICE",
    ),
    is_industrial: sqlBool(industriale),
  };
}

/* ------------------------------------------------------------- dotazioni */

const DOTAZIONI_ABITAZIONE = [
  ["hasLift", "Ascensore"],
  ["hasTerrace", "Terrazza"],
  ["hasBalcony", "Balcone"],
  ["hasGarden", "Giardino"],
  ["hasSwimmingPool", "Piscina"],
  ["hasAirConditioning", "Aria condizionata"],
  ["hasWardrobe", "Armadi a muro"],
  ["hasChimney", "Camino"],
  ["hasBoxRoom", "Ripostiglio"],
];

const DOTAZIONI_COMMERCIALI = [
  ["hasLoadingDock", "Banchina di carico"],
  ["hasSmokeExtractor", "Aspiratore fumi"],
  ["hasAirConditioning", "Aria condizionata"],
  ["hasHandicapedBaths", "Bagni accessibili"],
];

function raccogliDotazioni(annuncio) {
  const housing = annuncio?.property?.housing ?? {};
  const trading = annuncio?.property?.trading ?? {};
  const warehouse = trading?.warehouse ?? {};
  const extras = annuncio?.extras ?? {};
  const elenco = [];

  for (const [campo, etichetta] of DOTAZIONI_ABITAZIONE) {
    if (bool(housing[campo]) === true) elenco.push(etichetta);
  }
  for (const [campo, etichetta] of DOTAZIONI_COMMERCIALI) {
    if (bool(warehouse[campo]) === true && !elenco.includes(etichetta)) {
      elenco.push(etichetta);
    }
  }
  if (bool(trading?.hasHeating) === true) elenco.push("Riscaldamento");
  if (bool(trading?.hasArchive) === true) elenco.push("Archivio");

  if (
    bool(housing?.parkingSpace?.hasParkingSpace) === true ||
    bool(warehouse?.hasParkingSpace) === true
  ) {
    elenco.push("Posto auto");
  }
  if (bool(warehouse?.hasOutDoorParkingSpace) === true) {
    elenco.push("Parcheggio esterno");
  }

  const cucina = E.label(E.AMENITY, housing?.amenity);
  if (cucina) elenco.push(cucina);

  const pavimento = E.FLOOR_MATERIAL[int(extras?.FLOORTYPE) ?? -1];
  if (pavimento) elenco.push(`Pavimento in ${pavimento.toLowerCase()}`);

  for (const o of toArray(housing?.orientations)) {
    const et = E.label(E.ORIENTAMENTO, o);
    if (et) elenco.push(`Esposizione ${et.toLowerCase()}`);
  }

  if (bool(extras?.HASSTEELDOOR) === true) elenco.push("Porta blindata");
  if (bool(extras?.ISHANDICAPPEDADAPTED) === true) elenco.push("Accessibile ai disabili");

  return [...new Set(elenco)];
}

/* ------------------------------------------------------------ immagini */

function raccogliImmagini(annuncio, maxFoto) {
  return toArray(annuncio?.multimedias?.pictures)
    .map((foto) => ({
      idealista_image_id: str(foto?.id),
      tag: str(foto?.multimediaTag),
      url: str(foto?.multimediaPath),
      position: int(foto?.position) ?? 9999,
      width: int(foto?.widthPixels),
      height: int(foto?.heightPixels),
    }))
    .filter((f) => f.url !== null && /^https?:\/\//i.test(f.url))
    .sort((a, b) => a.position - b.position || String(a.idealista_image_id).localeCompare(String(b.idealista_image_id)))
    .slice(0, maxFoto);
}

/* --------------------------------------------------------------- prezzi */

/**
 * Il prezzo puo' mancare sotto SALE e trovarsi sotto RENT, o mancare del
 * tutto (<SALE /> <RENT />). Non si assume mai che SALE esista.
 */
function leggiPrezzi(annuncio) {
  const perOperazione = annuncio?.prices?.byOperation ?? {};
  const prezzi = {};
  for (const chiave of E.OPERAZIONE_KEYS) {
    const nodo = perOperazione?.[chiave];
    const valore = num(nodo?.price);
    if (valore !== null && valore > 0) prezzi[chiave] = valore;
  }
  return prezzi;
}

/** L'operazione dichiarata da <operations>, con ripiego sui prezzi presenti. */
function scegliOperazione(annuncio, prezzi) {
  const dichiarata = E.key(E.OPERAZIONE_KEYS, annuncio?.operations);
  if (dichiarata && prezzi[dichiarata] !== undefined) return dichiarata;
  const conPrezzo = E.OPERAZIONE_KEYS.find((k) => prezzi[k] !== undefined);
  if (conPrezzo) return conPrezzo;
  return dichiarata ?? null;
}

/* --------------------------------------------------------------- titolo */

function componiTitolo(tipologia, operazioneKey, luogo) {
  const tipo = tipologia ?? "Immobile";
  const azione =
    operazioneKey === "RENT"
      ? "in affitto"
      : operazioneKey === "RENT_TO_OWN"
        ? "in affitto con riscatto"
        : "in vendita";
  return luogo ? `${tipo} ${azione} a ${luogo}` : `${tipo} ${azione}`;
}

/* ------------------------------------------------------- impronta */

/**
 * Impronta del contenuto: se non cambia fra due sincronizzazioni l'annuncio
 * e' "unchanged" e la riga non viene riscritta inutilmente.
 */
function impronta(record, immagini) {
  const materiale = JSON.stringify({
    ...record,
    // Campi che cambiano a ogni sync e non indicano una modifica reale.
    last_synced_at: undefined,
    last_seen_sync_id: undefined,
    created_at: undefined,
    updated_at: undefined,
    raw_json: undefined,
    immagini: immagini.map((i) => [i.idealista_image_id, i.url, i.position, i.tag]),
  });
  return createHash("sha256").update(materiale).digest("hex").slice(0, 32);
}

/* ------------------------------------------------------- normalizzazione */

/**
 * Normalizza un singolo <ad>.
 *
 * @param annuncio  nodo <ad> grezzo
 * @param opzioni   { scopeAmmessi?: number[], maxFoto?: number, conservaGrezzo?: boolean }
 * @returns {{ property: object, images: object[] } | { scartato: string, id: string|null }}
 */
export function normalizzaAnnuncio(annuncio, opzioni = {}) {
  const scopeAmmessi = opzioni.scopeAmmessi ?? [0];
  const maxFoto = opzioni.maxFoto ?? 200;
  const conservaGrezzo = opzioni.conservaGrezzo ?? false;

  const id = str(annuncio?.id);
  if (!id) return { scartato: "annuncio senza id", id: null };

  // 1. Scope: istruzione di pubblicazione, si applica prima di tutto.
  const scopeRaw = int(annuncio?.scope);
  if (scopeRaw === null) return { scartato: "scope assente", id };
  if (!scopeAmmessi.includes(scopeRaw)) {
    const nome = E.key(E.SCOPE_KEYS, scopeRaw) ?? `scope ${scopeRaw}`;
    return { scartato: `scope ${scopeRaw} (${nome})`, id };
  }

  const proprieta = annuncio?.property ?? {};
  const housing = proprieta?.housing ?? {};
  const indirizzoGrezzo = primo(
    proprieta?.address,
    proprieta?.myAddress,
    proprieta?.listingAddress,
  ) ?? {};

  const zone = leggiZone(indirizzoGrezzo);
  const indirizzo = componiIndirizzo(indirizzoGrezzo, zone);

  const tip = E.decode(E.TIPOLOGIA_KEYS, E.TIPOLOGIA, proprieta?.typology);
  const prezzi = leggiPrezzi(annuncio);
  const operazioneKey = scegliOperazione(annuncio, prezzi);
  const operazioneSlug = operazioneKey
    ? E.OPERAZIONE_SLUG[E.OPERAZIONE_KEYS.indexOf(operazioneKey)]
    : null;
  const prezzo = operazioneKey ? (prezzi[operazioneKey] ?? null) : null;

  const descrizione = scegliDescrizione(annuncio?.comments);
  const luogo = localitaBreve(zone, indirizzoGrezzo);
  const caratteristiche = leggiCaratteristiche(proprieta, tip.key);
  const energia = E.decode(E.ENERGIA_KEYS, E.ENERGIA, proprieta?.energy?.certification);

  const sottotipo =
    E.label(E.CHALET_TYPE, housing?.chaletType) ??
    E.label(E.COUNTRY_HOUSE_TYPE, housing?.countryHouseType) ??
    E.label(E.WAREHOUSE_TYPE, proprieta?.trading?.warehouse?.ubication) ??
    null;

  const immagini = raccogliImmagini(annuncio, maxFoto);
  const parcheggio = housing?.parkingSpace ?? {};

  const property = {
    source: "idealista",
    idealista_id: id,
    external_reference: str(annuncio?.externalReference),
    slug: `${slugify(
      `${tip.label ?? "immobile"}-${operazioneSlug === "rent" ? "affitto" : "vendita"}-${luogo ?? ""}`,
    )}-${id}`,

    operation: operazioneSlug,
    price: prezzo,
    price_currency: "EUR",
    price_on_application: sqlBool(
      bool(annuncio?.extras?.HASPRICEONAPPLICATION) === true || prezzo === null,
    ),
    community_costs: num(proprieta?.communityCosts),
    deposit: E.label(E.DEPOSIT, proprieta?.deposit),

    property_type: tip.key,
    property_type_raw: tip.raw,
    property_type_label: tip.label,
    property_subtype: sottotipo,
    is_commercial: caratteristiche.is_commercial,
    is_industrial: caratteristiche.is_industrial,

    title: componiTitolo(tip.label, operazioneKey, luogo),
    description: descrizione.testo,
    description_language: descrizione.lingua,
    description_is_fallback: sqlBool(descrizione.ripiego),
    descriptions_json: JSON.stringify(descrizione.tutte),

    property_area: caratteristiche.property_area,
    usable_area: caratteristiche.usable_area,
    plot_area: caratteristiche.plot_area,
    rooms: caratteristiche.rooms,
    bedrooms: caratteristiche.bedrooms,
    bathrooms: caratteristiche.bathrooms,
    floor: indirizzo.floor,
    building_floors: caratteristiche.building_floors,
    construction_year: caratteristiche.construction_year,

    address_visibility: indirizzo.address_visibility,
    street: indirizzo.street,
    street_number: indirizzo.street_number,
    street_public: indirizzo.street_public,
    street_number_public: indirizzo.street_number_public,
    postal_code: indirizzo.postal_code,
    city: indirizzo.city,
    province: indirizzo.province,
    zone: indirizzo.zone,
    district: indirizzo.district,
    country: indirizzo.country,
    latitude: indirizzo.latitude,
    longitude: indirizzo.longitude,
    coordinates_public: indirizzo.coordinates_public,

    energy_certification: energia.key,
    energy_certification_raw: energia.raw,
    has_terrace: sqlBool(bool(housing?.hasTerrace)),
    has_balcony: sqlBool(bool(housing?.hasBalcony)),
    has_garden: sqlBool(bool(housing?.hasGarden)),
    has_swimming_pool: sqlBool(bool(housing?.hasSwimmingPool)),
    has_lift: sqlBool(bool(housing?.hasLift)),
    has_air_conditioning: sqlBool(bool(housing?.hasAirConditioning)),
    has_box_room: sqlBool(bool(housing?.hasBoxRoom)),
    has_wardrobe: sqlBool(bool(housing?.hasWardrobe)),
    has_parking: sqlBool(bool(parcheggio?.hasParkingSpace)),
    parking_included: sqlBool(bool(parcheggio?.isIncludedInPrice)),
    parking_price: num(parcheggio?.parkingSpacePrice),
    features_json: JSON.stringify(raccogliDotazioni(annuncio)),

    status: "active",
    scope: scopeRaw,
    images_count: immagini.length,

    source_created_at: isoDaMillisecondi(annuncio?.creation),
    source_modified_at: isoDaMillisecondi(annuncio?.modification),

    raw_json: conservaGrezzo ? JSON.stringify(annuncio) : null,
  };

  property.content_hash = impronta(property, immagini);

  return { property, images: immagini };
}

/**
 * Normalizza l'intero feed.
 * Un annuncio malformato NON interrompe l'importazione: viene contato fra gli
 * errori e si prosegue.
 *
 * @returns {{ properties: object[], images: Map<string, object[]>, scarti: object, errori: string[] }}
 */
export function normalizzaFeed(annunci, opzioni = {}) {
  const properties = [];
  const images = new Map();
  const scarti = {};
  const errori = [];
  const slugVisti = new Set();
  // Annunci PRESENTI nel feed ma esclusi dallo scope. Vanno tracciati: se uno
  // di questi e' gia' a database va disattivato subito, perche' e' una
  // istruzione esplicita della sorgente, non un'assenza da interpretare.
  const esclusiPerScope = new Set();

  for (const annuncio of annunci) {
    let esito;
    try {
      esito = normalizzaAnnuncio(annuncio, opzioni);
    } catch (e) {
      errori.push(
        `annuncio id=${str(annuncio?.id) ?? "?"}: ${e instanceof Error ? e.message : String(e)}`,
      );
      continue;
    }

    if (esito.scartato) {
      const motivo = esito.scartato;
      scarti[motivo] = (scarti[motivo] ?? 0) + 1;
      // Escluso per scope ma con id noto: l'annuncio esiste ancora su
      // idealista, semplicemente non e' piu' pubblicabile.
      if (esito.id && motivo.startsWith("scope ")) esclusiPerScope.add(esito.id);
      continue;
    }

    // Slug stabile e unico: se collide, si accoda un contatore. L'id in coda
    // rende la collisione rara e l'URL non cambia quando cambia la descrizione.
    let slug = esito.property.slug;
    let n = 2;
    while (slugVisti.has(slug)) slug = `${esito.property.slug}-${n++}`;
    slugVisti.add(slug);
    esito.property.slug = slug;

    properties.push(esito.property);
    images.set(esito.property.idealista_id, esito.images);
  }

  return { properties, images, scarti, errori, esclusiPerScope };
}
