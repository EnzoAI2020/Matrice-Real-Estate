/**
 * IdealistaPropertySyncService — persistenza idempotente del feed.
 *
 * Responsabilita':
 *   - lock: impedisce due importazioni contemporanee
 *   - upsert: crea o aggiorna per (source, idealista_id), mai duplica
 *   - immagini: sincronizzazione idempotente per (property_id, image_id)
 *   - "visti": traccia gli id presenti nel feed corrente
 *   - disattivazione: SOLO dopo un feed completo e riuscito
 *   - statistiche: scrive una riga in idealista_syncs
 *
 * REGOLA DI SICUREZZA CENTRALE
 * Nessun immobile viene mai cancellato. La disattivazione (status='inactive')
 * avviene solo se il chiamante dichiara esplicitamente feedCompleto=true e il
 * feed conteneva almeno un annuncio. Qualunque dubbio sulla completezza del
 * file -> nessuna disattivazione.
 */

/** Colonne scritte dall'upsert, nell'ordine usato per i parametri. */
const COLONNE = [
  "source", "idealista_id", "external_reference", "slug",
  "operation", "price", "price_currency", "price_on_application",
  "community_costs", "deposit",
  "property_type", "property_type_raw", "property_type_label", "property_subtype",
  "is_commercial", "is_industrial",
  "title", "description", "description_language", "description_is_fallback",
  "descriptions_json",
  "property_area", "usable_area", "plot_area", "rooms", "bedrooms", "bathrooms",
  "floor", "building_floors", "construction_year",
  "address_visibility", "street", "street_number", "street_public",
  "street_number_public", "postal_code", "city", "province", "zone", "district",
  "country", "latitude", "longitude", "coordinates_public",
  "energy_certification", "energy_certification_raw",
  "has_terrace", "has_balcony", "has_garden", "has_swimming_pool", "has_lift",
  "has_air_conditioning", "has_box_room", "has_wardrobe",
  "has_parking", "parking_included", "parking_price", "features_json",
  "status", "scope", "images_count",
  "source_created_at", "source_modified_at",
  "content_hash", "raw_json",
];

/** Percentuale oltre la quale una disattivazione di massa viene bloccata. */
const SOGLIA_DISATTIVAZIONE = 0.5;

/**
 * Massimo di parametri legati in un singolo statement.
 *
 * D1 ne accetta 100 (verificato empiricamente: 100 passa, 101 viene
 * rifiutato con "too many SQL variables"). SQLite in locale ne accetta 32766,
 * quindi questo limite NON emerge nei test locali: va rispettato qui.
 *
 * Si usa 90 per lasciare margine.
 */
const MAX_PARAMETRI = 90;

/** Parametri per ogni foto nell'INSERT multi-riga. */
const PARAMETRI_PER_FOTO = 9;

/** Foto per statement, entro il limite di D1. */
const FOTO_PER_LOTTO = Math.floor(MAX_PARAMETRI / PARAMETRI_PER_FOTO); // 10

/** Spezza un array in blocchi di dimensione massima n. */
function aLotti(elementi, n) {
  const lotti = [];
  for (let i = 0; i < elementi.length; i += n) lotti.push(elementi.slice(i, i + n));
  return lotti;
}

export class IdealistaPropertySyncService {
  /**
   * @param {object} c
   * @param {import('./db.mjs').SqliteDriver} c.db
   * @param {ReturnType<import('./logger.mjs').creaLogger>} c.log
   * @param {() => string} [c.now] iniettabile nei test
   */
  constructor({ db, log, now }) {
    this.db = db;
    this.log = log;
    this.now = now ?? (() => new Date().toISOString());
  }

  /* ------------------------------------------------------------- lock --- */

  /**
   * Acquisisce il lock creando la riga di sync in stato 'running'.
   * Un run piu' vecchio di lockTtlMinuti e' considerato morto e viene chiuso.
   *
   * @returns {Promise<number>} id della sincronizzazione
   * @throws se un'altra sincronizzazione e' gia' in corso
   */
  async acquisisciLock({ trigger = "manual", lockTtlMinuti = 60 } = {}) {
    const limite = new Date(Date.now() - lockTtlMinuti * 60_000).toISOString();

    const bloccate = await this.db.query(
      `SELECT id, started_at FROM idealista_syncs
        WHERE status = 'running' AND started_at > ?
        ORDER BY started_at DESC`,
      [limite],
    );

    if (bloccate.length > 0) {
      throw new Error(
        `Sincronizzazione gia' in corso (id ${bloccate[0].id}, avviata ${bloccate[0].started_at}). ` +
          `Nessuna seconda importazione avviata.`,
      );
    }

    // Run rimasti appesi oltre il TTL: chiusi come 'aborted'.
    const orfani = await this.db.run(
      `UPDATE idealista_syncs
          SET status = 'aborted',
              completed_at = ?,
              errors = COALESCE(errors, '["lock scaduto: run considerato morto"]')
        WHERE status = 'running' AND started_at <= ?`,
      [this.now(), limite],
    );
    if (orfani.changes > 0) {
      this.log.warn("Chiusi run rimasti in stato running oltre il TTL", {
        quanti: orfani.changes,
      });
    }

    const r = await this.db.run(
      `INSERT INTO idealista_syncs (status, trigger, started_at) VALUES ('running', ?, ?)`,
      [trigger, this.now()],
    );
    this.log.info("Lock acquisito", { syncId: r.lastInsertRowid, trigger });
    return r.lastInsertRowid;
  }

  /* ----------------------------------------------------------- upsert --- */

  /**
   * Crea o aggiorna un immobile. Chiave: (source, idealista_id).
   * Se content_hash non e' cambiato la riga non viene riscritta.
   *
   * @returns {Promise<{ id: number, esito: 'created'|'updated'|'unchanged' }>}
   */
  async upsertProperty(property, syncId) {
    const adesso = this.now();

    const esistente = (
      await this.db.query(
        `SELECT id, content_hash, status FROM properties WHERE source = ? AND idealista_id = ?`,
        [property.source, property.idealista_id],
      )
    )[0];

    // Lo slug deve restare stabile: se l'immobile esiste gia' si conserva
    // quello assegnato la prima volta, cosi' l'URL pubblico non cambia
    // quando cambia la descrizione o la zona.
    if (esistente) {
      const rigaSlug = (
        await this.db.query(`SELECT slug FROM properties WHERE id = ?`, [esistente.id])
      )[0];
      if (rigaSlug?.slug) property = { ...property, slug: rigaSlug.slug };
    } else {
      property = { ...property, slug: await this.#slugLibero(property.slug) };
    }

    if (
      esistente &&
      esistente.content_hash === property.content_hash &&
      esistente.status === "active"
    ) {
      // Nulla e' cambiato: si tocca solo il tracciamento.
      await this.db.run(
        `UPDATE properties SET last_seen_sync_id = ?, last_synced_at = ? WHERE id = ?`,
        [syncId, adesso, esistente.id],
      );
      return { id: esistente.id, esito: "unchanged" };
    }

    const valori = COLONNE.map((c) => property[c] ?? null);

    if (esistente) {
      const set = COLONNE.map((c) => `${c} = ?`).join(", ");
      await this.db.run(
        `UPDATE properties
            SET ${set},
                status = 'active',
                deactivated_at = NULL,
                last_seen_sync_id = ?,
                last_synced_at = ?,
                updated_at = ?
          WHERE id = ?`,
        [...valori, syncId, adesso, adesso, esistente.id],
      );
      return { id: esistente.id, esito: "updated" };
    }

    const segnaposto = COLONNE.map(() => "?").join(", ");
    const r = await this.db.run(
      `INSERT INTO properties (${COLONNE.join(", ")}, last_seen_sync_id, last_synced_at, created_at, updated_at)
       VALUES (${segnaposto}, ?, ?, ?, ?)`,
      [...valori, syncId, adesso, adesso, adesso],
    );
    return { id: r.lastInsertRowid, esito: "created" };
  }

  /** Garantisce l'unicita' dello slug al primo inserimento. */
  async #slugLibero(slugDesiderato) {
    let slug = slugDesiderato;
    let n = 2;
    for (;;) {
      const preso = await this.db.query(`SELECT 1 FROM properties WHERE slug = ? LIMIT 1`, [slug]);
      if (preso.length === 0) return slug;
      slug = `${slugDesiderato}-${n++}`;
      if (n > 50) return `${slugDesiderato}-${Date.now()}`;
    }
  }

  /* --------------------------------------------------------- immagini --- */

  /**
   * Allinea le immagini di un immobile. Idempotente: le foto gia' presenti
   * vengono aggiornate, quelle sparite dal feed rimosse, nessun duplicato.
   * @returns {Promise<number>} numero di foto risultanti
   */
  async syncImages(propertyId, immagini) {
    const adesso = this.now();

    // Tutto parametrizzato: nessun valore del feed viene concatenato nell'SQL.
    // L'UPSERT e' multi-riga ma SPEZZATO IN LOTTI, perche' D1 accetta al
    // massimo 100 parametri per statement (limite assente in SQLite locale:
    // un annuncio da 40 foto passava in locale e falliva su D1).
    for (const lotto of aLotti(immagini, FOTO_PER_LOTTO)) {
      const righe = lotto.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
      const valori = [];
      for (const img of lotto) {
        valori.push(
          propertyId,
          String(img.idealista_image_id ?? img.url),
          img.tag, img.url, img.position,
          img.width, img.height, adesso, adesso,
        );
      }

      // ON CONFLICT sull'indice unico (property_id, idealista_image_id):
      // la foto gia' presente viene aggiornata, mai duplicata.
      await this.db.run(
        `INSERT INTO property_images
           (property_id, idealista_image_id, tag, url, position, width, height, created_at, updated_at)
         VALUES ${righe}
         ON CONFLICT (property_id, idealista_image_id) DO UPDATE SET
           tag        = excluded.tag,
           url        = excluded.url,
           position   = excluded.position,
           width      = excluded.width,
           height     = excluded.height,
           updated_at = excluded.updated_at`,
        valori,
      );
    }

    // Foto sparite dal feed: si eliminano per timestamp invece che con un
    // NOT IN (lista), che con 200 foto sforerebbe il limite di parametri.
    // Ogni foto ancora nel feed e' stata appena toccata con updated_at =
    // adesso; quelle rimaste indietro non ci sono piu'. Due soli parametri.
    await this.db.run(
      `DELETE FROM property_images WHERE property_id = ? AND updated_at < ?`,
      [propertyId, adesso],
    );

    await this.db.run(`UPDATE properties SET images_count = ? WHERE id = ?`, [
      immagini.length,
      propertyId,
    ]);

    return immagini.length;
  }

  /* --------------------------------------------------- disattivazione --- */

  /**
   * Disattiva gli immobili PRESENTI nel feed ma esclusi dallo scope
   * (tipicamente scope 1 o 2).
   *
   * Perche' e' separato da deactivateMissing():
   * uno scope 2 e' una ISTRUZIONE ESPLICITA della sorgente ("non pubblicare"),
   * non un'assenza da interpretare. Non va quindi subordinato ne' alla cautela
   * sul feed incompleto ne' a --no-deactivate: se idealista dice di togliere
   * un annuncio dal sito, lo si toglie subito.
   *
   * L'assenza dal feed, al contrario, e' ambigua (puo' essere un file
   * parziale) e resta gestita dall'altra funzione, con tutte le sue cautele.
   *
   * @returns {Promise<{ disattivati: number, id: string[] }>}
   */
  async deactivateExcludedByScope(syncId, idEsclusi) {
    if (!idEsclusi || idEsclusi.size === 0) return { disattivati: 0, id: [] };

    const adesso = this.now();
    const id = [];

    // A lotti: la lista IN (...) e' fatta di parametri e D1 ne accetta 100
    // per statement. Lo UPDATE porta 3 parametri fissi, quindi il lotto e'
    // ridotto di altrettanto.
    for (const lotto of aLotti([...idEsclusi], MAX_PARAMETRI - 3)) {
      const segnaposto = lotto.map(() => "?").join(",");

      const colpiti = await this.db.query(
        `SELECT idealista_id FROM properties
          WHERE source = 'idealista' AND status = 'active'
            AND idealista_id IN (${segnaposto})`,
        lotto,
      );
      if (colpiti.length === 0) continue;

      await this.db.run(
        `UPDATE properties
            SET status = 'inactive', deactivated_at = ?, updated_at = ?,
                last_seen_sync_id = ?
          WHERE source = 'idealista' AND status = 'active'
            AND idealista_id IN (${segnaposto})`,
        [adesso, adesso, syncId, ...lotto],
      );

      id.push(...colpiti.map((c) => String(c.idealista_id)));
    }

    if (id.length === 0) return { disattivati: 0, id: [] };
    this.log.info("Disattivati per scope non pubblicabile (istruzione esplicita)", {
      quanti: id.length,
      id: id.slice(0, 20),
    });
    return { disattivati: id.length, id };
  }

  /**
   * Disattiva gli immobili assenti dal feed corrente.
   *
   * NON cancella nulla e NON fa niente se:
   *   - feedCompleto !== true              (download/parsing incerto)
   *   - il feed non conteneva annunci      (file probabilmente incompleto)
   *   - la disattivazione supererebbe SOGLIA_DISATTIVAZIONE degli attivi
   *
   * @returns {Promise<{ disattivati: number, saltato: string|null }>}
   */
  async deactivateMissing(syncId, { feedCompleto, idVisti }) {
    if (feedCompleto !== true) {
      const motivo = "feed non dichiarato completo";
      this.log.warn("Disattivazione saltata", { motivo });
      return { disattivati: 0, saltato: motivo };
    }
    if (!idVisti || idVisti.size === 0) {
      const motivo = "il feed non conteneva annunci pubblicabili";
      this.log.warn("Disattivazione saltata", { motivo });
      return { disattivati: 0, saltato: motivo };
    }

    const attivi = (
      await this.db.query(
        `SELECT COUNT(*) AS n FROM properties WHERE source = 'idealista' AND status = 'active'`,
      )
    )[0];
    const totaleAttivi = Number(attivi?.n ?? 0);

    const candidati = await this.db.query(
      `SELECT id, idealista_id FROM properties
        WHERE source = 'idealista'
          AND status = 'active'
          AND (last_seen_sync_id IS NULL OR last_seen_sync_id != ?)`,
      [syncId],
    );

    if (candidati.length === 0) return { disattivati: 0, saltato: null };

    // Valvola di sicurezza: una disattivazione di massa e' quasi sempre il
    // sintomo di un feed parziale, non di un portafoglio svuotato in un giorno.
    if (totaleAttivi > 0 && candidati.length / totaleAttivi > SOGLIA_DISATTIVAZIONE) {
      const motivo =
        `disattivazione di massa bloccata: ${candidati.length} su ${totaleAttivi} attivi ` +
        `(> ${Math.round(SOGLIA_DISATTIVAZIONE * 100)}%). Feed probabilmente incompleto.`;
      this.log.error("Disattivazione saltata", { motivo });
      return { disattivati: 0, saltato: motivo };
    }

    const adesso = this.now();
    await this.db.run(
      `UPDATE properties
          SET status = 'inactive', deactivated_at = ?, updated_at = ?
        WHERE source = 'idealista'
          AND status = 'active'
          AND (last_seen_sync_id IS NULL OR last_seen_sync_id != ?)`,
      [adesso, adesso, syncId],
    );

    this.log.info("Immobili disattivati (non cancellati)", {
      quanti: candidati.length,
      id: candidati.slice(0, 20).map((c) => c.idealista_id),
    });
    return { disattivati: candidati.length, saltato: null };
  }

  /* ------------------------------------------------------ chiusura --- */

  async completaSync(syncId, stats) {
    await this.db.run(
      `UPDATE idealista_syncs
          SET status = ?, completed_at = ?, source_filename = ?, source_bytes = ?,
              records_received = ?, records_created = ?, records_updated = ?,
              records_unchanged = ?, records_skipped = ?, records_deactivated = ?,
              images_synced = ?, duration_ms = ?, errors = ?, notes = ?
        WHERE id = ?`,
      [
        stats.status,
        this.now(),
        stats.sourceFilename ?? null,
        stats.sourceBytes ?? null,
        stats.received ?? 0,
        stats.created ?? 0,
        stats.updated ?? 0,
        stats.unchanged ?? 0,
        stats.skipped ?? 0,
        stats.deactivated ?? 0,
        stats.imagesSynced ?? 0,
        stats.durationMs ?? null,
        stats.errors?.length ? JSON.stringify(stats.errors) : null,
        stats.notes ?? null,
        syncId,
      ],
    );
  }

  async fallisciSync(syncId, errore, extra = {}) {
    await this.completaSync(syncId, {
      status: "failed",
      errors: [String(errore)],
      ...extra,
    });
  }

  /* ------------------------------------------------------ importazione --- */

  /**
   * Scrive nel database le proprieta' gia' normalizzate.
   * Non conosce ne' FTP ne' XML: riceve dati puliti.
   */
  async importaProprieta(syncId, properties, immaginiPerId) {
    const stats = { created: 0, updated: 0, unchanged: 0, imagesSynced: 0, errori: [] };
    const idVisti = new Set();

    for (const property of properties) {
      try {
        const { id, esito } = await this.upsertProperty(property, syncId);
        stats[esito] += 1;
        idVisti.add(property.idealista_id);

        const immagini = immaginiPerId.get(property.idealista_id) ?? [];
        stats.imagesSynced += await this.syncImages(id, immagini);
      } catch (e) {
        const messaggio = `immobile ${property.idealista_id}: ${e instanceof Error ? e.message : String(e)}`;
        stats.errori.push(messaggio);
        this.log.error("Errore su un immobile, importazione proseguita", {
          idealistaId: property.idealista_id,
          errore: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return { stats, idVisti };
  }
}
