/**
 * Lettura degli immobili — SOLO LATO SERVER.
 *
 * Questo modulo non deve mai finire nel bundle del browser: viene importato
 * unicamente da createServerFn() e dagli handler delle rotte /api.
 *
 * Due sorgenti dietro la stessa interfaccia:
 *   - produzione : binding D1 esposto dal Worker Cloudflare
 *   - sviluppo   : file SQLite locale .data/idealista.sqlite (stesso schema)
 *
 * Se nessuna delle due e' raggiungibile le funzioni restituiscono un elenco
 * vuoto con `disponibile: false`, cosi' le pagine mostrano uno stato onesto
 * invece di andare in errore.
 */

import type {
  ElencoImmobili,
  FiltriImmobili,
  ImmagineImmobile,
  ImmobilePubblico,
  Operazione,
  StatoSincronizzazione,
} from "./types";
import { ETICHETTA_OPERAZIONE, formattaPrezzo } from "./types";

/** Nome del binding D1 da configurare su Cloudflare. */
const BINDING_D1 = "IDEALISTA_DB";

type RigaQualsiasi = Record<string, unknown>;

type Lettore = {
  query: (sql: string, params?: unknown[]) => Promise<RigaQualsiasi[]>;
};

let lettoreCache: Lettore | null | undefined;

/* ------------------------------------------------------------ sorgente --- */

async function apriLettore(): Promise<Lettore | null> {
  if (lettoreCache !== undefined) return lettoreCache;
  lettoreCache = (await apriD1()) ?? (await apriSqliteLocale());
  return lettoreCache;
}

/** Binding D1 nel Worker Cloudflare. */
async function apriD1(): Promise<Lettore | null> {
  try {
    const mod = (await import(/* @vite-ignore */ "cloudflare:workers")) as {
      env?: Record<string, unknown>;
    };
    const binding = mod?.env?.[BINDING_D1] as
      | { prepare: (sql: string) => { bind: (...a: unknown[]) => { all: () => Promise<{ results?: RigaQualsiasi[] }> }; all: () => Promise<{ results?: RigaQualsiasi[] }> } }
      | undefined;
    if (!binding?.prepare) return null;

    return {
      async query(sql, params = []) {
        const stmt = binding.prepare(sql);
        const esito = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
        return esito.results ?? [];
      },
    };
  } catch {
    // Non siamo in un Worker: si passa al ripiego locale.
    return null;
  }
}

/** File SQLite locale, usato dal server di sviluppo (che gira in Node). */
async function apriSqliteLocale(): Promise<Lettore | null> {
  try {
    const [{ DatabaseSync }, { existsSync }, path, url] = await Promise.all([
      import(/* @vite-ignore */ "node:sqlite") as Promise<{ DatabaseSync: new (p: string) => { prepare: (s: string) => { all: (...a: unknown[]) => RigaQualsiasi[] } } }>,
      import(/* @vite-ignore */ "node:fs"),
      import(/* @vite-ignore */ "node:path"),
      import(/* @vite-ignore */ "node:url"),
    ]);

    const qui = path.dirname(url.fileURLToPath(import.meta.url));
    const candidati = [
      process.env["IDEALISTA_DB_FILE"],
      path.resolve(qui, "../../../.data/idealista.sqlite"),
      path.resolve(process.cwd(), ".data/idealista.sqlite"),
    ].filter((p): p is string => Boolean(p));

    const file = candidati.find((p) => existsSync(p));
    if (!file) return null;

    const db = new DatabaseSync(file);
    return {
      async query(sql, params = []) {
        return db.prepare(sql).all(...(params as never[]));
      },
    };
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------- mapping --- */

function n(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
}

function s(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const x = String(v).trim();
  return x === "" ? null : x;
}

function jsonArray(v: unknown): string[] {
  const testo = s(v);
  if (!testo) return [];
  try {
    const parsed: unknown = JSON.parse(testo);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Da riga di database a oggetto pubblico.
 *
 * Legge SOLO le colonne *_public per l'indirizzo: le colonne interne
 * (street, street_number, latitude/longitude quando coordinates_public = 0)
 * non vengono mai copiate nell'oggetto restituito.
 */
function versoPubblico(riga: RigaQualsiasi, immagini: ImmagineImmobile[]): ImmobilePubblico {
  const operazione = (s(riga["operation"]) as Operazione | null) ?? null;
  const prezzo = n(riga["price"]);
  const coordinatePubbliche = Number(riga["coordinates_public"] ?? 0) === 1;
  const lat = n(riga["latitude"]);
  const lng = n(riga["longitude"]);

  const via = s(riga["street_public"]);
  const civico = s(riga["street_number_public"]);

  return {
    id: Number(riga["id"]),
    slug: String(riga["slug"]),
    riferimento: s(riga["external_reference"]),

    operazione,
    operazioneEtichetta: operazione ? ETICHETTA_OPERAZIONE[operazione] : "—",
    prezzo,
    prezzoEtichetta: formattaPrezzo(prezzo, operazione),
    prezzoSuRichiesta: Number(riga["price_on_application"] ?? 0) === 1,
    speseCondominio: n(riga["community_costs"]),
    cauzione: s(riga["deposit"]),

    tipologia: s(riga["property_type"]),
    tipologiaEtichetta: s(riga["property_type_label"]),
    sottotipo: s(riga["property_subtype"]),
    commerciale: Number(riga["is_commercial"] ?? 0) === 1,
    industriale: Number(riga["is_industrial"] ?? 0) === 1,

    titolo: s(riga["title"]) ?? "Immobile",
    descrizione: s(riga["description"]),

    superficie: n(riga["property_area"]),
    superficieUtile: n(riga["usable_area"]),
    superficieTerreno: n(riga["plot_area"]),
    locali: n(riga["rooms"]),
    camere: n(riga["bedrooms"]),
    bagni: n(riga["bathrooms"]),
    piano: n(riga["floor"]),
    pianiEdificio: n(riga["building_floors"]),
    annoCostruzione: n(riga["construction_year"]),

    indirizzo: {
      via,
      civico,
      completo: [via, civico].filter(Boolean).join(", ") || null,
      cap: s(riga["postal_code"]),
      comune: s(riga["city"]),
      provincia: s(riga["province"]),
      zona: s(riga["zone"]),
      quartiere: s(riga["district"]),
      coordinate:
        coordinatePubbliche && lat !== null && lng !== null ? { lat, lng } : null,
    },

    classeEnergetica: s(riga["energy_certification"]),
    dotazioni: jsonArray(riga["features_json"]),

    immagini,
    copertina: immagini[0]?.url ?? null,
    numeroImmagini: immagini.length,

    aggiornatoIl: s(riga["source_modified_at"]),
  };
}

/** Colonne lette: nessuna colonna riservata compare in questo elenco. */
const COLONNE_PUBBLICHE = `
  id, slug, external_reference,
  operation, price, price_on_application, community_costs, deposit,
  property_type, property_type_label, property_subtype, is_commercial, is_industrial,
  title, description,
  property_area, usable_area, plot_area, rooms, bedrooms, bathrooms,
  floor, building_floors, construction_year,
  street_public, street_number_public, postal_code, city, province, zone, district,
  latitude, longitude, coordinates_public,
  energy_certification, features_json, source_modified_at
`;

async function caricaImmagini(
  lettore: Lettore,
  idImmobili: number[],
): Promise<Map<number, ImmagineImmobile[]>> {
  const mappa = new Map<number, ImmagineImmobile[]>();
  if (idImmobili.length === 0) return mappa;

  const segnaposto = idImmobili.map(() => "?").join(",");
  const righe = await lettore.query(
    `SELECT property_id, idealista_image_id, tag, url, position, width, height
       FROM property_images
      WHERE property_id IN (${segnaposto})
      ORDER BY property_id, position`,
    idImmobili,
  );

  for (const r of righe) {
    const pid = Number(r["property_id"]);
    if (!mappa.has(pid)) mappa.set(pid, []);
    mappa.get(pid)!.push({
      id: s(r["idealista_image_id"]),
      url: String(r["url"]),
      tag: s(r["tag"]),
      position: Number(r["position"] ?? 0),
      width: n(r["width"]),
      height: n(r["height"]),
    });
  }
  return mappa;
}

/* ---------------------------------------------------------------- query --- */

const LIMITE_MASSIMO = 60;

/** Elenco pubblico. Restituisce SOLO gli immobili attivi. */
export async function elencaImmobili(filtri: FiltriImmobili = {}): Promise<ElencoImmobili> {
  const vuoto: ElencoImmobili = {
    immobili: [],
    totale: 0,
    disponibile: false,
    opzioni: { tipologie: [], comuni: [], operazioni: [] },
  };

  const lettore = await apriLettore();
  if (!lettore) return vuoto;

  try {
    const dove: string[] = ["status = 'active'"];
    const params: unknown[] = [];

    if (filtri.operazione) {
      dove.push("operation = ?");
      params.push(filtri.operazione);
    }
    if (filtri.tipologia) {
      dove.push("property_type = ?");
      params.push(filtri.tipologia);
    }
    if (filtri.comune) {
      dove.push("city = ?");
      params.push(filtri.comune);
    }
    if (typeof filtri.prezzoMin === "number") {
      dove.push("price >= ?");
      params.push(filtri.prezzoMin);
    }
    if (typeof filtri.prezzoMax === "number") {
      dove.push("price <= ?");
      params.push(filtri.prezzoMax);
    }
    if (typeof filtri.superficieMin === "number") {
      dove.push("property_area >= ?");
      params.push(filtri.superficieMin);
    }
    if (typeof filtri.superficieMax === "number") {
      dove.push("property_area <= ?");
      params.push(filtri.superficieMax);
    }

    const clausola = dove.join(" AND ");
    const limite = Math.min(Math.max(filtri.limite ?? LIMITE_MASSIMO, 1), LIMITE_MASSIMO);
    const offset = Math.max(filtri.offset ?? 0, 0);

    const righe = await lettore.query(
      `SELECT ${COLONNE_PUBBLICHE}
         FROM properties
        WHERE ${clausola}
        ORDER BY COALESCE(source_modified_at, '') DESC, id DESC
        LIMIT ? OFFSET ?`,
      [...params, limite, offset],
    );

    const totaleRiga = await lettore.query(
      `SELECT COUNT(*) AS n FROM properties WHERE ${clausola}`,
      params,
    );

    const idImmobili = righe.map((r) => Number(r["id"]));
    const immagini = await caricaImmagini(lettore, idImmobili);

    const [tipologie, comuni, operazioni] = await Promise.all([
      lettore.query(
        `SELECT DISTINCT property_type AS v, property_type_label AS e
           FROM properties WHERE status = 'active' AND property_type IS NOT NULL
          ORDER BY e`,
      ),
      lettore.query(
        `SELECT DISTINCT city AS v FROM properties
          WHERE status = 'active' AND city IS NOT NULL ORDER BY v`,
      ),
      lettore.query(
        `SELECT DISTINCT operation AS v FROM properties
          WHERE status = 'active' AND operation IS NOT NULL`,
      ),
    ]);

    return {
      immobili: righe.map((r) => versoPubblico(r, immagini.get(Number(r["id"])) ?? [])),
      totale: Number(totaleRiga[0]?.["n"] ?? 0),
      disponibile: true,
      opzioni: {
        tipologie: tipologie.map((t) => ({
          valore: String(t["v"]),
          etichetta: s(t["e"]) ?? String(t["v"]),
        })),
        comuni: comuni.map((c) => String(c["v"])),
        operazioni: operazioni
          .map((o) => s(o["v"]) as Operazione | null)
          .filter((o): o is Operazione => o !== null),
      },
    };
  } catch (errore) {
    console.error("[immobili] lettura elenco fallita", errore);
    return vuoto;
  }
}

/** Scheda singola per slug. Solo immobili attivi. */
export async function immobilePerSlug(slug: string): Promise<ImmobilePubblico | null> {
  const lettore = await apriLettore();
  if (!lettore) return null;

  try {
    const righe = await lettore.query(
      `SELECT ${COLONNE_PUBBLICHE} FROM properties
        WHERE slug = ? AND status = 'active' LIMIT 1`,
      [slug],
    );
    const riga = righe[0];
    if (!riga) return null;

    const immagini = await caricaImmagini(lettore, [Number(riga["id"])]);
    return versoPubblico(riga, immagini.get(Number(riga["id"])) ?? []);
  } catch (errore) {
    console.error("[immobili] lettura scheda fallita", errore);
    return null;
  }
}

/** Ultimo esito di sincronizzazione, per la pagina di stato. */
export async function ultimaSincronizzazione(): Promise<StatoSincronizzazione | null> {
  const lettore = await apriLettore();
  if (!lettore) return null;
  try {
    const righe = await lettore.query(
      `SELECT id, status, trigger, started_at, completed_at, source_filename,
              records_received, records_created, records_updated, records_unchanged,
              records_skipped, records_deactivated, images_synced, duration_ms, notes
         FROM idealista_syncs
        ORDER BY started_at DESC LIMIT 1`,
    );
    const r = righe[0];
    if (!r) return null;

    return {
      id: Number(r["id"]),
      status: String(r["status"]),
      trigger: s(r["trigger"]),
      started_at: String(r["started_at"]),
      completed_at: s(r["completed_at"]),
      source_filename: s(r["source_filename"]),
      records_received: Number(r["records_received"] ?? 0),
      records_created: Number(r["records_created"] ?? 0),
      records_updated: Number(r["records_updated"] ?? 0),
      records_unchanged: Number(r["records_unchanged"] ?? 0),
      records_skipped: Number(r["records_skipped"] ?? 0),
      records_deactivated: Number(r["records_deactivated"] ?? 0),
      images_synced: Number(r["images_synced"] ?? 0),
      duration_ms: n(r["duration_ms"]),
      notes: s(r["notes"]),
    };
  } catch {
    return null;
  }
}
