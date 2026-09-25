/**
 * IdealistaFtpClient — recupero del feed dall'FTP di idealista/tools.
 *
 * Trasporto: curl. Motivi della scelta invece di un client FTP npm:
 *   - zero dipendenze nuove (questo progetto ha una patch manuale in
 *     node_modules che ogni reinstallazione cancella, vedi ARCHIVE-INFO.md);
 *   - curl gestisce gia' modalita' passiva, timeout e ripresa;
 *   - e' presente sia in locale sia sui runner di GitHub Actions.
 *
 * Protocollo: FTP semplice sulla porta 21, SENZA TLS, come da configurazione
 * fornita. Non viene passato --ssl proprio per non tentare AUTH TLS.
 *
 * CREDENZIALI: passate a curl con --user e mai scritte nei log. Ogni messaggio
 * d'errore passa da redigi() prima di uscire.
 */

import { execFile } from "node:child_process";
import { mkdir, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const eseguiFile = promisify(execFile);

/** Estensioni accettate come feed. */
const ESTENSIONI_FEED = /\.(xml|json)$/i;

/**
 * Rimuove qualunque credenziale da un testo destinato a log o errori.
 * Rete di sicurezza: le credenziali non dovrebbero mai arrivarci.
 */
export function redigi(testo, utente, password) {
  let out = String(testo ?? "");
  if (password) out = out.split(password).join("***");
  if (utente) out = out.split(utente).join("***");
  // ftp://utente:password@host  ->  ftp://***:***@host
  out = out.replace(/(ftps?:\/\/)[^@\s/]+:[^@\s/]+@/gi, "$1***:***@");
  return out;
}

export class IdealistaFtpClient {
  /**
   * @param {object} config
   * @param {string} config.host
   * @param {number} [config.port=21]
   * @param {string} config.user
   * @param {string} config.password
   * @param {string} [config.path="/"]
   * @param {number} [config.timeoutSec=120]
   * @param {(livello: string, messaggio: string, dati?: object) => void} [config.log]
   */
  constructor(config) {
    this.host = config.host;
    this.port = config.port ?? 21;
    this.user = config.user;
    this.password = config.password;
    this.path = config.path ?? "/";
    this.timeoutSec = config.timeoutSec ?? 120;
    this.log = config.log ?? (() => {});

    if (!this.host) throw new Error("Host FTP mancante");
    if (!this.user || !this.password) {
      throw new Error(
        "Credenziali FTP mancanti: impostare IDEALISTA_FTP_USER e " +
          "IDEALISTA_FTP_PASSWORD nell'ambiente (mai nel repository).",
      );
    }
  }

  /** URL della cartella remota, senza credenziali. */
  get baseUrl() {
    const p = this.path.startsWith("/") ? this.path : `/${this.path}`;
    const conSlash = p.endsWith("/") ? p : `${p}/`;
    return `ftp://${this.host}:${this.port}${conSlash}`;
  }

  get #credenziali() {
    return ["--user", `${this.user}:${this.password}`];
  }

  async #curl(argomenti, opzioni = {}) {
    try {
      return await eseguiFile("curl", argomenti, {
        maxBuffer: 512 * 1024 * 1024,
        ...opzioni,
      });
    } catch (e) {
      const messaggio = redigi(
        e?.stderr || e?.message || String(e),
        this.user,
        this.password,
      );
      throw new Error(`curl FTP fallito: ${messaggio}`);
    }
  }

  /**
   * Elenca i file candidati nella cartella remota.
   * @returns {Promise<string[]>}
   */
  async listFiles() {
    this.log("info", "FTP: connessione", { host: this.host, port: this.port, path: this.path });

    const { stdout } = await this.#curl([
      "--silent",
      "--show-error",
      "--disable-epsv",
      "--connect-timeout", "30",
      "--max-time", String(this.timeoutSec),
      "--list-only",
      ...this.#credenziali,
      this.baseUrl,
    ]);

    const file = stdout
      .split(/\r?\n/)
      .map((r) => r.trim())
      .filter((r) => r && r !== "." && r !== "..")
      .filter((r) => ESTENSIONI_FEED.test(r));

    this.log("info", "FTP: elenco ottenuto", { candidati: file.length });
    return file;
  }

  /**
   * Sceglie il file del feed.
   *
   * idealista lascia un solo file. Se ne trova piu' d'uno prova a
   * disambiguare con una data nel nome; se non ci riesce FALLISCE ed elenca
   * i nomi disponibili, invece di importare il file sbagliato.
   *
   * @param {string[]} file
   * @returns {string}
   */
  selectFeedFile(file) {
    if (file.length === 0) {
      throw new Error(`Nessun file .xml/.json trovato in ${this.baseUrl}`);
    }
    if (file.length === 1) {
      this.log("info", "FTP: file selezionato", { file: file[0], fra: 1 });
      return file[0];
    }

    // Piu' file: si tenta una data YYYYMMDD o YYYY-MM-DD nel nome.
    const conData = file
      .map((nome) => {
        const m = nome.match(/(20\d{2})-?(\d{2})-?(\d{2})/);
        return m ? { nome, data: `${m[1]}${m[2]}${m[3]}` } : null;
      })
      .filter(Boolean);

    if (conData.length === file.length) {
      conData.sort((a, b) => b.data.localeCompare(a.data));
      const scelto = conData[0].nome;
      this.log("warn", "FTP: piu' file presenti, scelto il piu' recente per data nel nome", {
        file: scelto,
        fra: file.length,
        disponibili: file,
      });
      return scelto;
    }

    // Ambiguo: meglio fermarsi che importare il feed sbagliato.
    throw new Error(
      `Selezione del feed ambigua: ${file.length} file candidati e nessuna ` +
        `data riconoscibile nei nomi. File disponibili: ${file.join(", ")}. ` +
        `Impostare IDEALISTA_FTP_FILE per forzare il nome corretto.`,
    );
  }

  /**
   * Scarica il feed nella cartella indicata.
   * @returns {Promise<{ path: string, filename: string, bytes: number }>}
   */
  async download(filename, cartellaDestinazione) {
    await mkdir(cartellaDestinazione, { recursive: true });
    const destinazione = join(cartellaDestinazione, filename);

    this.log("info", "FTP: download in corso", { file: filename });

    await this.#curl([
      "--silent",
      "--show-error",
      "--fail",
      "--disable-epsv",
      "--connect-timeout", "30",
      "--max-time", String(this.timeoutSec),
      ...this.#credenziali,
      this.baseUrl + encodeURIComponent(filename),
      "--output", destinazione,
    ]);

    const info = await stat(destinazione);
    if (info.size === 0) {
      throw new Error(`Il file scaricato e' vuoto: ${filename}`);
    }

    this.log("info", "FTP: download completato", { file: filename, bytes: info.size });
    return { path: destinazione, filename, bytes: info.size };
  }

  /**
   * Scorciatoia: elenca, sceglie, scarica.
   * Con IDEALISTA_FTP_FILE impostato salta la selezione automatica.
   */
  async fetchFeed(cartellaDestinazione, nomeForzato = null) {
    const filename = nomeForzato ?? this.selectFeedFile(await this.listFiles());
    return this.download(filename, cartellaDestinazione);
  }
}

/** Costruisce il client leggendo l'ambiente. */
export function clientDaAmbiente(env = process.env, log) {
  return new IdealistaFtpClient({
    host: env["IDEALISTA_FTP_HOST"] ?? "ftp.habitania.com",
    port: Number(env["IDEALISTA_FTP_PORT"] ?? 21),
    user: env["IDEALISTA_FTP_USER"] ?? "",
    password: env["IDEALISTA_FTP_PASSWORD"] ?? "",
    path: env["IDEALISTA_FTP_PATH"] ?? "/",
    log,
  });
}

/** Scrive un feed su disco (usato dai test e dalla modalita' offline). */
export async function salvaFeedLocale(contenuto, percorso) {
  await writeFile(percorso, contenuto, "utf8");
  return percorso;
}
