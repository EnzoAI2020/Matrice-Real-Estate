/**
 * Parser XML minimale, senza dipendenze, tarato sul feed idealista/tools.
 *
 * SICUREZZA — perche' questo parser non e' vulnerabile a XXE:
 * non risolve MAI entita' esterne, DOCTYPE o riferimenti a file. Le uniche
 * entita' riconosciute sono le cinque predefinite di XML piu' quelle
 * numeriche; DOCTYPE e istruzioni di elaborazione vengono rimossi prima
 * dell'analisi e mai interpretati. Non essendoci un risolutore di entita'
 * non esiste la superficie d'attacco XXE/billion-laughs tipica dei parser
 * generici configurati male.
 *
 * Il feed e' XML "semplice": nessun CDATA, nessun attributo sui nodi dati,
 * nessun contenuto misto. Per questo bastano ~150 righe invece di una
 * dipendenza esterna (che su questo progetto costringerebbe a reinstallare
 * node_modules e perdere la patch a @lovable.dev/mcp-js).
 *
 * Regole di conversione:
 *   <a>testo</a>      -> "testo"
 *   <a />             -> null        (nel feed significa "campo vuoto")
 *   <a></a>           -> null
 *   <a><b>1</b></a>   -> { b: "1" }
 *   <a>1</a><a>2</a>  -> [ "1", "2" ]  (tag ripetuti diventano array)
 */

const ENTITA = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
};

/** Limite di sicurezza: oltre questa dimensione il file e' sospetto. */
export const MAX_BYTES = 256 * 1024 * 1024;

/** Decodifica le entita' XML, incluse quelle numeriche &#38; e &#x26;. */
export function decodeEntities(s) {
  if (!s || s.indexOf("&") === -1) return s;
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (intero, corpo) => {
    if (corpo[0] === "#") {
      const codice =
        corpo[1] === "x" || corpo[1] === "X"
          ? parseInt(corpo.slice(2), 16)
          : parseInt(corpo.slice(1), 10);
      return Number.isFinite(codice) && codice >= 0 && codice <= 0x10ffff
        ? String.fromCodePoint(codice)
        : intero;
    }
    // Solo entita' predefinite: nessuna entita' personalizzata o esterna.
    return ENTITA[corpo] ?? intero;
  });
}

/** Inserisce una chiave, trasformando in array se gia' presente. */
function assegna(oggetto, chiave, valore) {
  if (!Object.prototype.hasOwnProperty.call(oggetto, chiave)) {
    oggetto[chiave] = valore;
    return;
  }
  const attuale = oggetto[chiave];
  if (Array.isArray(attuale)) attuale.push(valore);
  else oggetto[chiave] = [attuale, valore];
}

/**
 * Converte una stringa XML in oggetti JS annidati.
 * Ritorna il contenuto dell'elemento radice.
 * @throws {Error} se l'input non e' una stringa o supera MAX_BYTES
 */
export function parseXml(sorgente) {
  if (typeof sorgente !== "string") {
    throw new TypeError("parseXml richiede una stringa");
  }
  if (sorgente.length > MAX_BYTES) {
    throw new Error(`XML troppo grande: ${sorgente.length} byte (max ${MAX_BYTES})`);
  }

  // BOM UTF-8: il feed idealista ce l'ha, romperebbe il primo match.
  let xml = sorgente.charCodeAt(0) === 0xfeff ? sorgente.slice(1) : sorgente;

  // Dichiarazione, commenti, DOCTYPE e PI vengono RIMOSSI, mai interpretati.
  // E' qui che si chiude la porta a XXE: nessun DOCTYPE raggiunge il parser.
  xml = xml
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!DOCTYPE[\s\S]*?(\[[\s\S]*?\][\s\S]*?)?>/gi, "");

  const radice = {};
  const pila = [{ figli: radice, testo: "" }];
  const TAG = /<\s*(\/)?\s*([A-Za-z_][\w.:-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/)?\s*>/g;

  let ultimoIndice = 0;
  let m;

  while ((m = TAG.exec(xml)) !== null) {
    const [intero, chiusura, nome, , autochiusura] = m;

    // Il testo fra il tag precedente e questo appartiene al nodo in cima.
    pila[pila.length - 1].testo += xml.slice(ultimoIndice, m.index);
    ultimoIndice = m.index + intero.length;

    if (autochiusura) {
      // <tag /> : nel feed vuol dire "campo vuoto", non "oggetto vuoto".
      assegna(pila[pila.length - 1].figli, nome, null);
      continue;
    }

    if (!chiusura) {
      pila.push({ nome, figli: {}, testo: "" });
      continue;
    }

    // Chiusura: srotola fino al nodo corrispondente, cosi' un tag non chiuso
    // non manda fuori sincrono tutto il resto del documento.
    let profondita = pila.length - 1;
    while (profondita > 0 && pila[profondita].nome !== nome) profondita--;
    if (profondita === 0) continue; // chiusura orfana: ignorata

    while (pila.length - 1 >= profondita) {
      const nodo = pila.pop();
      const genitore = pila[pila.length - 1];
      const haFigli = Object.keys(nodo.figli).length > 0;
      let valore;
      if (haFigli) {
        valore = nodo.figli;
      } else {
        const testo = decodeEntities(nodo.testo).trim();
        valore = testo === "" ? null : testo;
      }
      assegna(genitore.figli, nodo.nome, valore);
    }
  }

  const chiavi = Object.keys(radice);
  return chiavi.length === 1 ? radice[chiavi[0]] : radice;
}

/**
 * Estrae gli annunci dalla radice del feed, accettando sia <ads><ad>...
 * sia una radice gia' scartata. Ritorna sempre un array.
 */
export function estraiAnnunci(radice) {
  if (!radice || typeof radice !== "object") return [];
  if (Array.isArray(radice)) return radice;
  if (radice.ad !== undefined) return toArray(radice.ad);
  if (radice.ads !== undefined) return estraiAnnunci(radice.ads);
  return [];
}

/** Normalizza un nodo che puo' arrivare singolo, come array o assente. */
export function toArray(valore) {
  if (valore === null || valore === undefined) return [];
  return Array.isArray(valore) ? valore : [valore];
}

/** Stringa non vuota, oppure null. */
export function str(valore) {
  if (valore === null || valore === undefined) return null;
  if (typeof valore === "object") return null;
  const s = String(valore).trim();
  return s === "" ? null : s;
}

/** Numero finito, oppure null. Accetta la virgola decimale. */
export function num(valore) {
  const s = str(valore);
  if (s === null) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Intero, oppure null. */
export function int(valore) {
  const n = num(valore);
  return n === null ? null : Math.trunc(n);
}

/** Booleano dai campi hasXxx: "true"/"false"/"1"/"0". null se assente. */
export function bool(valore) {
  const s = str(valore);
  if (s === null) return null;
  const b = s.toLowerCase();
  if (b === "true" || b === "1" || b === "si" || b === "yes") return true;
  if (b === "false" || b === "0" || b === "no") return false;
  return null;
}

/** Primo valore non nullo fra quelli passati. */
export function primo(...valori) {
  for (const v of valori) if (v !== null && v !== undefined) return v;
  return null;
}
