// ⚠️ DATI DI ESEMPIO — listino dimostrativo da sostituire con gli immobili reali
// di Matrice Group (testi, prezzi, superfici e fotografie).
// Le immagini sono placeholder già presenti in src/assets.

import heroVilla from "@/assets/hero-villa.jpg";
import interior from "@/assets/interior.jpg";
import palazzo from "@/assets/palazzo.jpg";
import capannone from "@/assets/capannone.jpg";
import retail from "@/assets/retail.jpg";
import commerciale from "@/assets/commerciale.jpg";

export type Tipologia = "Residenziale" | "Commerciale" | "NPL-Asta";

export type Immobile = {
  slug: string;
  titolo: string;
  tipologia: Tipologia;
  zona: string;
  mq: number;
  /** null = "Prezzo su richiesta" */
  prezzo: number | null;
  stato: string;
  copertina: string;
  galleria: string[];
  descrizione: string[];
  caratteristiche: { label: string; value: string }[];
  mappa: string;
};

export const immobili: Immobile[] = [
  {
    slug: "attico-panoramico-posillipo",
    titolo: "Attico panoramico con terrazzo",
    tipologia: "Residenziale",
    zona: "Napoli · Posillipo",
    mq: 185,
    prezzo: 1250000,
    stato: "Nuovo",
    copertina: heroVilla,
    galleria: [heroVilla, interior, palazzo],
    descrizione: [
      "Attico all'ultimo piano di un edificio signorile, con terrazzo vivibile e vista aperta sul golfo. Gli spazi interni sono stati completamente ristrutturati con finiture di pregio e impianti a norma.",
      "L'immobile si compone di ampio soggiorno con doppia esposizione, cucina abitabile, tre camere e due bagni, oltre a un locale lavanderia e a due posti auto di pertinenza.",
    ],
    caratteristiche: [
      { label: "Superficie", value: "185 mq + 60 mq terrazzo" },
      { label: "Locali", value: "5 locali · 3 camere · 2 bagni" },
      { label: "Piano", value: "Ultimo piano con ascensore" },
      { label: "Classe energetica", value: "B" },
      { label: "Stato", value: "Ristrutturato" },
    ],
    mappa: "Zona collinare di Posillipo, a pochi minuti da Via Petrarca, servita da mezzi pubblici e vicina a scuole, servizi e lungomare.",
  },
  {
    slug: "villa-bifamiliare-pozzuoli",
    titolo: "Villa bifamiliare con giardino",
    tipologia: "Residenziale",
    zona: "Pozzuoli (NA)",
    mq: 240,
    prezzo: 690000,
    stato: "Disponibile",
    copertina: interior,
    galleria: [interior, heroVilla, commerciale],
    descrizione: [
      "Porzione di villa bifamiliare su due livelli con giardino privato di 400 mq e ampio porticato. Soluzione ideale per famiglie, in contesto residenziale tranquillo e ben collegato.",
      "Al piano terra zona giorno con caminetto e cucina; al primo piano quattro camere e due bagni. Completa la proprietà un box doppio.",
    ],
    caratteristiche: [
      { label: "Superficie", value: "240 mq + 400 mq giardino" },
      { label: "Locali", value: "6 locali · 4 camere · 3 bagni" },
      { label: "Piano", value: "Su due livelli" },
      { label: "Classe energetica", value: "C" },
      { label: "Stato", value: "Ottimo" },
    ],
    mappa: "Area residenziale di Pozzuoli, vicina alla Tangenziale di Napoli e alla stazione della Cumana.",
  },
  {
    slug: "capannone-logistico-nola",
    titolo: "Capannone logistico con piazzale",
    tipologia: "Commerciale",
    zona: "Nola (NA) · Interporto",
    mq: 3200,
    prezzo: 2400000,
    stato: "Nuovo",
    copertina: capannone,
    galleria: [capannone, interior, retail],
    descrizione: [
      "Capannone di recente costruzione all'interno del polo logistico di Nola, con altezza utile di 10 metri, sei baie di carico e piazzale di manovra esclusivo.",
      "Struttura prefabbricata in cemento armato, impianto antincendio a norma, uffici su due livelli e impianto fotovoltaico in copertura.",
    ],
    caratteristiche: [
      { label: "Superficie", value: "3.200 mq coperti + 1.500 mq piazzale" },
      { label: "Altezza utile", value: "10 metri" },
      { label: "Baie di carico", value: "6 ribalte" },
      { label: "Uffici", value: "220 mq su due livelli" },
      { label: "Classe energetica", value: "A" },
    ],
    mappa: "A ridosso dell'Interporto Campano e dello svincolo A30, collegamento diretto con l'A16 e il porto di Napoli.",
  },
  {
    slug: "superficie-retail-casoria",
    titolo: "Superficie di vendita con parcheggio",
    tipologia: "Commerciale",
    zona: "Casoria (NA)",
    mq: 1450,
    prezzo: 1150000,
    stato: "Reddito garantito",
    copertina: retail,
    galleria: [retail, commerciale, capannone],
    descrizione: [
      "Immobile commerciale a destinazione media superficie di vendita, attualmente locato a operatore della grande distribuzione con contratto a reddito.",
      "Ampio parcheggio a raso da 60 posti auto, accesso carrabile indipendente per lo scarico merci e ottima visibilità su strada ad alto scorrimento.",
    ],
    caratteristiche: [
      { label: "Superficie", value: "1.450 mq di vendita" },
      { label: "Parcheggio", value: "60 posti auto" },
      { label: "Destinazione", value: "Media superficie di vendita" },
      { label: "Contratto", value: "Locazione in essere a reddito" },
      { label: "Classe energetica", value: "B" },
    ],
    mappa: "Asse commerciale di Casoria, a pochi minuti dall'uscita Asse Mediano e dal centro abitato.",
  },
  {
    slug: "palazzina-uffici-asta-napoli-centro",
    titolo: "Palazzina uffici da asta giudiziaria",
    tipologia: "NPL-Asta",
    zona: "Napoli · Centro direzionale",
    mq: 980,
    prezzo: null,
    stato: "Trattativa riservata",
    copertina: palazzo,
    galleria: [palazzo, commerciale, interior],
    descrizione: [
      "Palazzina a destinazione direzionale proveniente da procedura esecutiva, disponibile con assistenza completa alla partecipazione all'asta.",
      "Il nostro team segue l'analisi della perizia, la verifica urbanistica e ipocatastale, la presentazione dell'offerta e le fasi successive all'aggiudicazione.",
    ],
    caratteristiche: [
      { label: "Superficie", value: "980 mq su quattro livelli" },
      { label: "Destinazione", value: "Direzionale / uffici" },
      { label: "Procedura", value: "Esecuzione immobiliare" },
      { label: "Assistenza", value: "Tecnica, legale e fiscale" },
      { label: "Stato", value: "Da riqualificare" },
    ],
    mappa: "Area direzionale di Napoli, servita da metropolitana Linea 1 e collegamenti diretti con la tangenziale.",
  },
  {
    slug: "complesso-npl-saldo-stralcio-caserta",
    titolo: "Complesso immobiliare in saldo e stralcio",
    tipologia: "NPL-Asta",
    zona: "Provincia di Caserta",
    mq: 2100,
    prezzo: null,
    stato: "Riservato agli investitori",
    copertina: commerciale,
    galleria: [commerciale, capannone, palazzo],
    descrizione: [
      "Operazione NPL su complesso immobiliare misto (produttivo e direzionale) gestita con procedura di saldo e stralcio in accordo con l'istituto di credito.",
      "Documentazione completa disponibile su richiesta previa sottoscrizione di accordo di riservatezza; operazione riservata a investitori qualificati.",
    ],
    caratteristiche: [
      { label: "Superficie", value: "2.100 mq complessivi" },
      { label: "Destinazione", value: "Produttivo e direzionale" },
      { label: "Operazione", value: "Saldo e stralcio" },
      { label: "Documentazione", value: "Su richiesta con NDA" },
      { label: "Stato", value: "Da definire in due diligence" },
    ],
    mappa: "Provincia di Caserta, in area produttiva servita dalla rete autostradale A1.",
  },
];

export function formatPrezzo(prezzo: number | null) {
  if (prezzo === null) return "Prezzo su richiesta";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(prezzo);
}

export function getImmobile(slug: string) {
  return immobili.find((i) => i.slug === slug);
}
