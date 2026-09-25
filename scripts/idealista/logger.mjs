/**
 * Log strutturato per la sincronizzazione idealista.
 *
 * Ogni riga e' JSON quando LOG_FORMAT=json (comodo nei runner CI), altrimenti
 * testo leggibile. I segreti registrati con `proteggi()` vengono sostituiti in
 * ogni messaggio e in ogni campo dati prima della stampa: e' una rete di
 * sicurezza perche' password e credenziali non devono comunque mai arrivare
 * al logger.
 */

const SEGRETI = new Set();

/** Registra un valore da non stampare mai (password, token, ...). */
export function proteggi(valore) {
  if (typeof valore === "string" && valore.length >= 4) SEGRETI.add(valore);
}

/** Sostituisce i segreti noti in qualunque testo. */
export function oscura(testo) {
  let out = String(testo ?? "");
  for (const s of SEGRETI) out = out.split(s).join("***");
  out = out.replace(/(ftps?:\/\/)[^@\s/]+:[^@\s/]+@/gi, "$1***:***@");
  // Chiavi sospette in JSON: "password":"..." -> "password":"***"
  out = out.replace(
    /("?(?:password|passwd|pwd|token|secret|api[_-]?key|authorization)"?\s*[:=]\s*")([^"]*)(")/gi,
    "$1***$3",
  );
  return out;
}

function oscuraProfondo(valore) {
  if (valore === null || valore === undefined) return valore;
  if (typeof valore === "string") return oscura(valore);
  if (Array.isArray(valore)) return valore.map(oscuraProfondo);
  if (typeof valore === "object") {
    const out = {};
    for (const [k, v] of Object.entries(valore)) {
      if (/password|passwd|pwd|token|secret|api[_-]?key/i.test(k)) out[k] = "***";
      else out[k] = oscuraProfondo(v);
    }
    return out;
  }
  return valore;
}

const LIVELLI = { debug: 10, info: 20, warn: 30, error: 40 };

export function creaLogger(opzioni = {}) {
  const formato = opzioni.formato ?? process.env["LOG_FORMAT"] ?? "testo";
  const soglia = LIVELLI[opzioni.livello ?? process.env["LOG_LEVEL"] ?? "info"] ?? 20;
  const scrivi = opzioni.scrivi ?? ((riga) => console.log(riga));

  function emetti(livello, messaggio, dati) {
    if ((LIVELLI[livello] ?? 20) < soglia) return;
    const sicuro = dati ? oscuraProfondo(dati) : undefined;
    const testo = oscura(messaggio);

    if (formato === "json") {
      scrivi(
        JSON.stringify({
          ts: new Date().toISOString(),
          livello,
          messaggio: testo,
          ...(sicuro ? { dati: sicuro } : {}),
        }),
      );
      return;
    }

    const extra = sicuro
      ? " " +
        Object.entries(sicuro)
          .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`)
          .join(" ")
      : "";
    scrivi(`[${livello.toUpperCase().padEnd(5)}] ${testo}${extra}`);
  }

  return {
    debug: (m, d) => emetti("debug", m, d),
    info: (m, d) => emetti("info", m, d),
    warn: (m, d) => emetti("warn", m, d),
    error: (m, d) => emetti("error", m, d),
    /** Firma compatibile con il callback atteso da IdealistaFtpClient. */
    callback: (livello, m, d) => emetti(livello, m, d),
  };
}
