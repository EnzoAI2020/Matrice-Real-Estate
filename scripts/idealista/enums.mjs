/**
 * Strato unico di mappatura degli enumerati idealista/tools.
 *
 * Nel feed ogni enumerato arriva come intero a base zero (0,1,2,3...).
 * L'INDICE nell'array E' il valore inviato da idealista: non riordinare e non
 * rimuovere elementi, si sfaserebbe tutta la mappatura. Per aggiungerne, si
 * accoda in fondo.
 *
 * Fonte: "XML-JSON di idealista/tools", sezione Enumerati.
 *
 * Regola generale: un valore fuori tabella NON e' un errore fatale. Si
 * conserva il grezzo (vedi decode(), campo `raw`) e si ripiega su null, cosi'
 * un enum non documentato non corrompe il dato ne' blocca l'importazione.
 */

/**
 * Decodifica un enumerato conservando il valore grezzo.
 * @returns {{ raw: number|null, key: string|null, label: string|null, known: boolean }}
 */
export function decode(tabellaChiavi, tabellaEtichette, valore) {
  if (valore === null || valore === undefined || valore === "") {
    return { raw: null, key: null, label: null, known: false };
  }
  const raw = Number(valore);
  if (!Number.isInteger(raw) || raw < 0 || raw >= tabellaChiavi.length) {
    // Valore inatteso: si tiene il grezzo, il resto resta nullo.
    return { raw: Number.isFinite(raw) ? raw : null, key: null, label: null, known: false };
  }
  return {
    raw,
    key: tabellaChiavi[raw] ?? null,
    label: tabellaEtichette?.[raw] ?? null,
    known: true,
  };
}

/** Solo l'etichetta italiana, o null. */
export function label(tabella, valore) {
  if (valore === null || valore === undefined || valore === "") return null;
  const i = Number(valore);
  if (!Number.isInteger(i) || i < 0 || i >= tabella.length) return null;
  return tabella[i] ?? null;
}

/** Solo la chiave simbolica (SALE, HOME, ...), o null. */
export function key(tabellaChiavi, valore) {
  if (valore === null || valore === undefined || valore === "") return null;
  const i = Number(valore);
  if (!Number.isInteger(i) || i < 0 || i >= tabellaChiavi.length) return null;
  return tabellaChiavi[i] ?? null;
}

/* --------------------------------------------------------------- tipologie */

export const TIPOLOGIA_KEYS = [
  "HOME", "CHALET", "COUNTRYHOUSE", "GARAGE", "OFFICE", "WAREHOUSE", "ROOM",
  "LAND", "VACATIONAL", "NEW_DEVELOPMENT", "CUSTOM_AD", "STORAGEROOM", "BUILDING",
];

export const TIPOLOGIA = [
  "Appartamento", "Villa", "Casale", "Garage", "Ufficio", "Locale commerciale",
  "Stanza", "Terreno", "Casa vacanze", "Nuova costruzione", "Altro",
  "Deposito", "Edificio",
];

/**
 * Tipologie che non sono residenziali: per queste i dati utili stanno sotto
 * property.trading (office / warehouse) o property.land, non property.housing.
 */
export const TIPOLOGIE_NON_RESIDENZIALI = new Set([
  "OFFICE", "WAREHOUSE", "LAND", "GARAGE", "STORAGEROOM", "BUILDING",
]);

export const CHALET_TYPE = [
  "Non specificato", "Villa", "Villa a schiera", "Villa bifamiliare",
  "Villa indipendente", "Piano di villa",
];

export const COUNTRY_HOUSE_TYPE = [
  "Non specificato", "Casa di campagna", "Castello", "Palazzo", "Masia",
  "Cortijo", "Casale", "Casa di paese", "Casa a un piano", "Casamatta",
  "Torre", "Casa padronale", "Pazo", "Villa", "Palazzetto", "Masseria",
  "Fattoria", "Trullo", "Cascina", "Baita", "Quinta", "Mulino",
  "Monte alentejano", "Solar",
];

export const FLAT_SUB_TYPE = ["Attico", "Duplex"];

/* -------------------------------------------------------------- operazioni */

export const OPERAZIONE_KEYS = ["SALE", "RENT", "RENT_TO_OWN"];
export const OPERAZIONE = ["Vendita", "Affitto", "Affitto con riscatto"];

/** Valori normalizzati salvati a database. */
export const OPERAZIONE_SLUG = ["sale", "rent", "rent_to_own"];

export const OPERATION_STATUS = ["Disponibile", "Riservato", "Concluso"];

export const AD_CONTRACT = [
  "Non disponibile", "Esclusiva", "Co-esclusiva", "Non esclusiva", "Agente esclusivo",
];

/* ---------------------------------------------------- visibilita e stato */

/**
 * WEB_PUBLIC        -> pubblicabile sul sito dell'agenzia
 * MICROSITE_PRIVATE -> solo microsito privato
 * NOT_PUBLISHED     -> non pubblicare
 */
export const SCOPE_KEYS = ["WEB_PUBLIC", "MICROSITE_PRIVATE", "NOT_PUBLISHED"];
export const SCOPE = ["Pubblico", "Microsito privato", "Non pubblicato"];

/**
 * SHOW_ADDRESS      -> via + civico
 * ONLY_STREET_NAME  -> solo il nome della via, niente civico
 * HIDDEN_ADDRESS    -> nessun indirizzo, solo la zona
 */
export const ADDRESS_VISIBILITY_KEYS = [
  "SHOW_ADDRESS", "ONLY_STREET_NAME", "HIDDEN_ADDRESS",
];

export const STATE = ["Nuovo", "In attesa", "Attivo", "Inattivo", "Errore"];

/* ------------------------------------------------------------- condizioni */

export const BUILT_TYPE = ["Nuova costruzione", "Da ristrutturare", "Buono stato"];
export const PROPERTY_TYPE = ["Usato", "Nuova costruzione"];
export const PROPERTY_LOCATION_KEYS = ["EXTERNAL", "INTERNAL", "BOTH"];
export const PROPERTY_LOCATION = ["Esterno", "Interno", "Esterno e interno"];

export const ORIENTAMENTO_KEYS = ["NORTH", "SOUTH", "WEST", "EAST"];
export const ORIENTAMENTO = ["Nord", "Sud", "Ovest", "Est"];

export const AMENITY = [
  "Cucina attrezzata e arredata",
  "Cucina attrezzata, non arredata",
  "Cucina non attrezzata, arredata",
  "Cucina non attrezzata ne arredata",
];

export const AIR_CONDITIONING = [
  "Non disponibile", "Freddo", "Caldo/freddo", "Predisposizione",
];

export const BATHROOM = ["Servizi igienici", "Completo", "Entrambi"];

/* --------------------------------------------------------------- energia */

export const ENERGIA_KEYS = [
  "EXEMPT", "A1", "A2", "A3", "A4", "A", "B", "B_MINUS", "C", "D", "E", "F",
  "G", "UNKNOWN", "IN_PROCESS", "A_PLUS",
];

export const ENERGIA = [
  "Esente", "A1", "A2", "A3", "A4", "A", "B", "B-", "C", "D", "E", "F",
  "G", "Non specificata", "In corso", "A+",
];

export const ENERGIA_CERT_BUILT_TYPE = ["In progetto", "Completato"];

/* ----------------------------------------------------------- commerciale */

export const UBICATION = [
  "Non specificata", "In centro commerciale", "Su strada", "Ammezzato",
  "Interrato", "Altro",
];

export const WAREHOUSE_TYPE = ["Non specificato", "Commerciale", "Industriale"];

export const DISTRIBUTION = [
  "Non specificata", "Open space", "Divisa con pannelli", "Divisa con muri",
];

export const ROOM_DISTRIBUTION = [
  "Non specificata", "Open space", "1-2 locali", "3-5 locali",
  "5-10 locali", "Oltre 10 locali",
];

export const FACADE_AREA = [
  "Nessuna facciata", "1-4 metri", "5-8 metri", "9-12 metri", "Oltre 12 metri",
];

export const GARAGE_CAPACITY = [
  "Non specificata", "Auto compatta", "Berlina", "Moto",
  "Auto e moto", "Due o piu auto",
];

export const STORAGE_ROOM_ACCESS = ["Tutto il giorno", "Banchina di carico"];

/* ---------------------------------------------------------------- terreni */

export const LAND_TYPE = [
  "Non specificato", "Urbano", "Agricolo edificabile", "Agricolo non edificabile",
];

export const LAND_CLASSIFICATION = [
  "Residenziale", "Ville", "Uffici", "Commerciale", "Alberghiero",
  "Industriale", "Servizi pubblici", "Altro",
];

export const ACCESS = [
  "Strada urbana", "Strada", "Sterrato", "Nessun accesso",
  "Superstrada", "Non specificato",
];

export const DISTANCE = [
  "In citta", "Meno di 500 m", "500 m - 1 km", "1-2 km", "2-5 km",
  "5-10 km", "Oltre 10 km", "Non specificata", "Fuori citta",
];

/* ---------------------------------------------------------------- affitto */

export const DEPOSIT = [
  "Nessuna", "Una mensilita", "Due mensilita", "Tre mensilita",
  "Quattro mensilita", "Cinque mensilita", "Sei o piu mensilita",
];

/* --------------------------------------------------------------- contatto */

export const PREFERRED_CONTACT = ["Qualsiasi", "Solo email", "Solo telefono"];

export const AVAILABILITY_HOUR = [
  "Qualsiasi orario", "Mattina", "Mezzogiorno", "Pomeriggio",
  "Sera", "Fine settimana", "Orario d'ufficio",
];

/* --------------------------------------------------------------- lingue */

export const LINGUA_KEYS = [
  "SPANISH", "ENGLISH", "FRENCH", "GERMAN", "PORTUGUESE", "ITALIAN", "CATALAN",
  "RUSSIAN", "CHINESE", "EUSKERA", "FINNISH", "DUTCH", "POLISH", "ROMANIAN",
  "SWEDISH", "DANISH", "NORWAY", "GREEK",
];

/** Indice della lingua italiana nel feed. */
export const LINGUA_ITALIANO = 5;

/** Ripieghi, in ordine di preferenza, se manca la descrizione italiana. */
export const LINGUA_FALLBACK = [5, 1, 0, 2, 3, 4];

/* ------------------------------------------------------- tipo di strada */

/**
 * streetTypeId non e' un enumerato a base zero ma una lookup numerica sparsa.
 * I nomi nel documento sono spagnoli: qui l'equivalente italiano d'uso.
 */
export const STREET_TYPE = {
  1: "Accesso", 2: "Viale alberato", 3: "Alto", 4: "Arco", 6: "Autostrada",
  7: "Viale", 12: "Via", 15: "Vicolo", 18: "Strada", 24: "Strada provinciale",
  31: "Passeggiata", 34: "Ponte", 36: "Piazza", 40: "Rotonda", 42: "Traversa",
  45: "Via", 47: "", 51: "Galleria", 59: "Viale", 60: "Salita", 61: "Corsia",
  62: "Salita", 63: "Piazzale", 64: "Pozzo", 65: "Prolungamento", 66: "Porta",
  67: "Passaggio", 68: "Rambla", 69: "Circonvallazione", 70: "Sentiero",
  71: "Viottolo", 72: "Superstrada", 73: "Circonvallazione", 74: "Torrente",
  75: "Vicolo cieco",
};

/**
 * Extras/FLOORTYPE: pavimentazione. Lookup sparsa, NON l'enum FloorType
 * (che invece vale BASEMENT/SEMI_BASEMENT/GROUND_FLOOR/MEZZANINE).
 */
export const FLOOR_MATERIAL = {
  2: "Parquet", 3: "Gres", 4: "Marmo", 6: "Graniglia",
  8: "Ceramica", 10: "Piastrelle", 16: "Tavolato",
};

export const FLOOR_TYPE = ["Seminterrato", "Semi-interrato", "Piano terra", "Ammezzato"];
