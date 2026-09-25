/**
 * Accesso al database per la sincronizzazione.
 *
 * Due driver dietro la stessa interfaccia, cosi' il servizio di sync non sa
 * ne' gli importa dove sta scrivendo:
 *
 *   SqliteDriver  file locale o :memory: tramite node:sqlite (sviluppo e test)
 *   D1RestDriver  API REST di Cloudflare D1 (produzione, da GitHub Actions)
 *
 * D1 *e'* SQLite, quindi lo stesso SQL vale per entrambi: i test girano sulle
 * query reali, non su un finto.
 *
 * Interfaccia:
 *   query(sql, params)  -> Promise<rows[]>
 *   run(sql, params)    -> Promise<{ changes, lastInsertRowid }>
 *   batch(statements)   -> Promise<void>        (atomico dove possibile)
 *   exec(sqlScript)     -> Promise<void>        (migrazioni)
 *   close()             -> Promise<void>
 */

/* ------------------------------------------------------------- SQLite --- */

export class SqliteDriver {
  /** @param {string} percorso file .sqlite oppure ":memory:" */
  constructor(percorso = ":memory:") {
    this.percorso = percorso;
    this.db = null;
  }

  async apri() {
    if (this.db) return this;
    const { DatabaseSync } = await import("node:sqlite");
    this.db = new DatabaseSync(this.percorso);
    this.db.exec("PRAGMA foreign_keys = ON");
    return this;
  }

  #assicura() {
    if (!this.db) throw new Error("Driver SQLite non aperto: chiamare apri()");
    return this.db;
  }

  async exec(script) {
    this.#assicura().exec(script);
  }

  async query(sql, params = []) {
    return this.#assicura().prepare(sql).all(...normalizza(params));
  }

  async run(sql, params = []) {
    const r = this.#assicura().prepare(sql).run(...normalizza(params));
    return {
      changes: Number(r.changes ?? 0),
      lastInsertRowid: Number(r.lastInsertRowid ?? 0),
    };
  }

  async batch(statements) {
    const db = this.#assicura();
    db.exec("BEGIN");
    try {
      for (const { sql, params } of statements) {
        db.prepare(sql).run(...normalizza(params ?? []));
      }
      db.exec("COMMIT");
    } catch (e) {
      try {
        db.exec("ROLLBACK");
      } catch {
        /* rollback best-effort */
      }
      throw e;
    }
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

/* ---------------------------------------------------------- D1 REST --- */

/**
 * Driver per l'API REST di Cloudflare D1.
 *
 * Serve perche' la sincronizzazione gira su GitHub Actions (dove l'FTP e'
 * possibile) mentre il database vive su Cloudflare. Il token non compare mai
 * nei log: viaggia solo nell'header Authorization.
 */
export class D1RestDriver {
  /**
   * @param {object} c
   * @param {string} c.accountId
   * @param {string} c.databaseId
   * @param {string} c.apiToken
   * @param {number} [c.timeoutMs=60000]
   */
  constructor(c) {
    this.accountId = c.accountId;
    this.databaseId = c.databaseId;
    this.apiToken = c.apiToken;
    this.timeoutMs = c.timeoutMs ?? 60_000;

    if (!this.accountId || !this.databaseId || !this.apiToken) {
      throw new Error(
        "Configurazione D1 incompleta: servono CLOUDFLARE_ACCOUNT_ID, " +
          "CLOUDFLARE_D1_DATABASE_ID e CLOUDFLARE_API_TOKEN.",
      );
    }
  }

  get #endpoint() {
    return `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;
  }

  async #invia(sql, params) {
    const risposta = await fetch(this.#endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params: normalizza(params ?? []) }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    let corpo;
    try {
      corpo = await risposta.json();
    } catch {
      throw new Error(`D1: risposta non JSON (HTTP ${risposta.status})`);
    }

    if (!risposta.ok || corpo?.success === false) {
      const errori = (corpo?.errors ?? [])
        .map((e) => `${e.code ?? ""} ${e.message ?? ""}`.trim())
        .join("; ");
      // Il token non compare: si riportano solo i messaggi dell'API.
      throw new Error(`D1: errore API (HTTP ${risposta.status}) ${errori}`);
    }

    return corpo.result ?? [];
  }

  async exec(script) {
    // L'API accetta piu' statement separati da ';' in una sola chiamata.
    await this.#invia(script, []);
  }

  async query(sql, params = []) {
    const risultato = await this.#invia(sql, params);
    return risultato[0]?.results ?? [];
  }

  async run(sql, params = []) {
    const risultato = await this.#invia(sql, params);
    const meta = risultato[0]?.meta ?? {};
    return {
      changes: Number(meta.changes ?? 0),
      lastInsertRowid: Number(meta.last_row_id ?? 0),
    };
  }

  /**
   * Esegue piu' statement, ognuno PARAMETRIZZATO.
   *
   * Scelte e limiti, dichiarati apertamente:
   *
   * - NIENTE BEGIN/COMMIT espliciti: l'endpoint /query di D1 non supporta il
   *   controllo esplicito delle transazioni e restituisce errore.
   * - NIENTE interpolazione dei valori: `params` vale per un solo statement,
   *   quindi si manda una chiamata per statement invece di concatenarli.
   *   E' piu' lento ma elimina del tutto l'escaping fatto a mano.
   * - Di conseguenza l'atomicita' e' PER STATEMENT, non sull'intero batch.
   *   Il sync e' costruito per tollerarlo: e' idempotente, quindi una
   *   riesecuzione dopo un'interruzione riporta il dato nello stato giusto.
   *
   * Il chiamante e' comunque incoraggiato a preferire pochi statement
   * multi-riga (vedi syncImages) invece di molti statement singoli.
   */
  async batch(statements) {
    for (const { sql, params } of statements) {
      await this.#invia(sql, params ?? []);
    }
  }

  async close() {
    /* niente da chiudere: HTTP senza stato */
  }
}

/* -------------------------------------------------------------- utili --- */

/** SQLite non accetta boolean/undefined: si normalizzano i parametri. */
function normalizza(params) {
  return params.map((p) => {
    if (p === undefined) return null;
    if (typeof p === "boolean") return p ? 1 : 0;
    if (typeof p === "bigint") return Number(p);
    return p;
  });
}


/* ------------------------------------------------------------ fabbrica --- */

/**
 * Costruisce il driver secondo l'ambiente.
 * --local / IDEALISTA_DB_FILE  -> SQLite su file
 * altrimenti                    -> D1 REST
 */
export async function creaDriver(opzioni = {}, env = process.env) {
  if (opzioni.driver === "sqlite" || opzioni.file) {
    const d = new SqliteDriver(opzioni.file ?? env["IDEALISTA_DB_FILE"] ?? ":memory:");
    await d.apri();
    return d;
  }
  if (env["IDEALISTA_DB_FILE"]) {
    const d = new SqliteDriver(env["IDEALISTA_DB_FILE"]);
    await d.apri();
    return d;
  }
  return new D1RestDriver({
    accountId: env["CLOUDFLARE_ACCOUNT_ID"] ?? "",
    databaseId: env["CLOUDFLARE_D1_DATABASE_ID"] ?? "",
    apiToken: env["CLOUDFLARE_API_TOKEN"] ?? "",
  });
}
