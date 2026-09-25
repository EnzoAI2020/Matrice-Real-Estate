/**
 * Tipi pubblici degli immobili.
 *
 * Questo file viene incluso anche nel bundle del browser: contiene SOLO la
 * forma dei dati destinati al pubblico. I campi riservati (via e civico esatti
 * quando l'indirizzo e' nascosto, coordinate non pubblicabili, raw_json,
 * dati del publisher) non compaiono qui e non escono mai dall'API.
 */

export type Operazione = "sale" | "rent" | "rent_to_own";

export type ImmagineImmobile = {
  id: string | null;
  url: string;
  tag: string | null;
  position: number;
  width: number | null;
  height: number | null;
};

export type ImmobilePubblico = {
  id: number;
  slug: string;
  riferimento: string | null;

  operazione: Operazione | null;
  operazioneEtichetta: string;
  prezzo: number | null;
  prezzoEtichetta: string;
  prezzoSuRichiesta: boolean;
  speseCondominio: number | null;
  cauzione: string | null;

  tipologia: string | null;
  tipologiaEtichetta: string | null;
  sottotipo: string | null;
  commerciale: boolean;
  industriale: boolean;

  titolo: string;
  descrizione: string | null;

  superficie: number | null;
  superficieUtile: number | null;
  superficieTerreno: number | null;
  locali: number | null;
  camere: number | null;
  bagni: number | null;
  piano: number | null;
  pianiEdificio: number | null;
  annoCostruzione: number | null;

  /** Gia' filtrato secondo addressVisible: quello che c'e' si puo' mostrare. */
  indirizzo: {
    via: string | null;
    civico: string | null;
    completo: string | null;
    cap: string | null;
    comune: string | null;
    provincia: string | null;
    zona: string | null;
    quartiere: string | null;
    /** null quando l'indirizzo e' nascosto: niente mappa. */
    coordinate: { lat: number; lng: number } | null;
  };

  classeEnergetica: string | null;
  dotazioni: string[];

  immagini: ImmagineImmobile[];
  copertina: string | null;
  numeroImmagini: number;

  aggiornatoIl: string | null;
};

/** Ultimo esito di sincronizzazione, per la pagina di stato. */
export type StatoSincronizzazione = {
  id: number;
  status: string;
  trigger: string | null;
  started_at: string;
  completed_at: string | null;
  source_filename: string | null;
  records_received: number;
  records_created: number;
  records_updated: number;
  records_unchanged: number;
  records_skipped: number;
  records_deactivated: number;
  images_synced: number;
  duration_ms: number | null;
  notes: string | null;
};

export type FiltriImmobili = {
  operazione?: Operazione;
  tipologia?: string;
  comune?: string;
  prezzoMin?: number;
  prezzoMax?: number;
  superficieMin?: number;
  superficieMax?: number;
  limite?: number;
  offset?: number;
};

export type ElencoImmobili = {
  immobili: ImmobilePubblico[];
  totale: number;
  /** false quando il database non e' raggiungibile: la pagina lo dice. */
  disponibile: boolean;
  opzioni: {
    tipologie: { valore: string; etichetta: string }[];
    comuni: string[];
    operazioni: Operazione[];
  };
};

export const ETICHETTA_OPERAZIONE: Record<Operazione, string> = {
  sale: "Vendita",
  rent: "Affitto",
  rent_to_own: "Affitto con riscatto",
};

const formattatorePrezzo = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formattaPrezzo(
  prezzo: number | null,
  operazione: Operazione | null,
): string {
  if (prezzo === null) return "Prezzo su richiesta";
  const base = formattatorePrezzo.format(prezzo);
  return operazione === "rent" ? `${base}/mese` : base;
}

/** "Napoli · Chiaia", o la parte piu' precisa disponibile. */
export function luogoBreve(immobile: ImmobilePubblico): string {
  const { comune, zona, quartiere, provincia } = immobile.indirizzo;
  const parti = [comune ?? provincia, quartiere ?? zona].filter(
    (p): p is string => Boolean(p),
  );
  return parti.length > 0 ? parti.join(" · ") : "Localita non indicata";
}

/** Righe sintetiche per la card: 95 m² · 3 locali · 2 bagni */
export function sintesi(immobile: ImmobilePubblico): string[] {
  const righe: string[] = [];
  if (immobile.superficie !== null) righe.push(`${immobile.superficie} m²`);
  if (immobile.locali !== null) {
    righe.push(`${immobile.locali} local${immobile.locali === 1 ? "e" : "i"}`);
  }
  if (immobile.bagni !== null) {
    righe.push(`${immobile.bagni} bagn${immobile.bagni === 1 ? "o" : "i"}`);
  }
  return righe;
}
