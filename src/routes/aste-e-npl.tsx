import { createFileRoute } from "@tanstack/react-router";
import { ServicePage, faqJsonLd } from "@/components/ServicePage";
import hero from "@/assets/palazzo.jpg";

const faqs = [
  {
    q: "Comprare all'asta giudiziaria è rischioso?",
    a: "Il rischio non sta nell'asta in sé, ma nella mancanza di verifiche. Prima di ogni offerta leggiamo la perizia del CTU, controlliamo lo stato di occupazione dell'immobile, la conformità urbanistica e catastale, le spese condominiali arretrate e i tempi previsti per la liberazione. Se un elemento non torna, ti sconsigliamo l'operazione: l'affare migliore è spesso quello che non si fa.",
  },
  {
    q: "Che cos'è il saldo e stralcio e a chi conviene?",
    a: "È l'accordo con cui la banca o il fondo accetta una somma inferiore al debito residuo per liberare l'immobile dall'ipoteca e chiudere la posizione. Conviene al debitore, che esce dall'esecuzione evitando l'asta e riducendo l'esposizione, e all'investitore, che acquista a un prezzo negoziato senza le incognite della gara. Serve però una trattativa strutturata con l'istituto di credito, con numeri e tempi verificabili.",
  },
  {
    q: "Ho ricevuto un pignoramento sulla casa: posso ancora fare qualcosa?",
    a: "Nella maggior parte dei casi sì, ma il tempo è la variabile decisiva. Finché non è stata emessa l'aggiudicazione esistono margini: conversione del pignoramento, vendita concordata con autorizzazione del giudice, saldo e stralcio con il creditore. Il primo incontro è riservato e gratuito, e serve a capire con onestà quali strade sono ancora aperte.",
  },
  {
    q: "Che cosa sono gli NPL immobiliari?",
    a: "Sono crediti deteriorati (Non Performing Loans) garantiti da ipoteca su immobili, ceduti dalle banche a fondi specializzati. Chi acquista il credito può gestirlo attraverso l'esecuzione o accordi transattivi. Matrice Group affianca sia gli investitori nella selezione dei portafogli sia i debitori nella trattativa con il fondo che ha rilevato la posizione.",
  },
  {
    q: "Servono tutti i soldi subito per partecipare a un'asta?",
    a: "No. All'offerta si allega una cauzione, di norma il 10% del prezzo offerto, e il saldo va versato entro il termine fissato nel decreto, in genere 90-120 giorni. In quel periodo è possibile attivare un mutuo per acquisto all'asta: ti aiutiamo a impostarlo prima della gara, non dopo.",
  },
];

export const Route = createFileRoute("/aste-e-npl")({
  head: () => ({
    meta: [
      { title: "Aste giudiziarie Napoli, NPL e saldo e stralcio | Matrice Group" },
      {
        name: "description",
        content:
          "Assistenza su aste giudiziarie a Napoli, crediti deteriorati NPL e saldo e stralcio: analisi della perizia, valutazione dei rischi, offerta e trattativa con banche e fondi.",
      },
      { property: "og:title", content: "Aste giudiziarie, NPL e saldo e stralcio a Napoli" },
      {
        property: "og:description",
        content:
          "Acquisto all'asta e gestione di crediti deteriorati con verifiche complete: perizia, occupazione, ipoteche e trattativa con l'istituto di credito.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [{ type: "application/ld+json", children: faqJsonLd(faqs) }],
  }),
  component: Page,
});

function Page() {
  return (
    <ServicePage
      eyebrow="Servizio / Aste e NPL"
      title="Aste, NPL e"
      titleItalic="saldo e stralcio"
      intro="Un percorso guidato tra esecuzioni immobiliari, crediti deteriorati e trattative con banche e fondi, a Napoli e in tutta la Campania."
      image={hero}
      imageAlt="Palazzo storico oggetto di procedura esecutiva"
      paragrafi={[
        "Le aste giudiziarie e i crediti deteriorati sono il terreno dove si crea più valore e si commettono più errori. Dietro un prezzo base allettante possono nascondersi un immobile occupato, un abuso edilizio non sanabile, spese condominiali arretrate di anni o un contenzioso ancora aperto. La differenza tra un'ottima operazione e un problema lungo anni sta interamente nel lavoro fatto prima di presentare l'offerta.",
        "Matrice Group affianca due profili molto diversi. Da un lato l'investitore, privato o professionale, che vuole acquistare all'asta o rilevare posizioni NPL con un'analisi seria del rendimento. Dall'altro la famiglia o l'imprenditore che si trova dentro un'esecuzione immobiliare e ha bisogno di capire, senza giri di parole, quali margini di manovra restano.",
        "Per chi investe, il percorso parte dalla lettura integrale della perizia del CTU e degli avvisi di vendita. Verifichiamo stato di occupazione e titolo del detentore, conformità urbanistica e catastale, provenienza, gravami che restano o si cancellano con il decreto di trasferimento, spese condominiali insolute e tempi stimati di liberazione. Solo a quel punto calcoliamo il prezzo massimo sostenibile, includendo oneri, ristrutturazione e mesi di immobilizzo, e definiamo la strategia d'offerta.",
        "Per chi è in difficoltà, lavoriamo sul saldo e stralcio: apriamo una trattativa con la banca o con il fondo che ha rilevato il credito per chiudere la posizione a un importo inferiore al debito, liberando l'immobile dall'ipoteca ed evitando la vendita all'incanto. È una procedura che richiede numeri documentati, un acquirente credibile e tempi rispettati; per questo la impostiamo insieme a legali e professionisti di fiducia, coordinando ogni passaggio.",
        "In entrambi i casi il principio è lo stesso: nessuna promessa che non possiamo mantenere. Se un'operazione non regge, lo diciamo subito. Se regge, ti accompagniamo fino al decreto di trasferimento e, se necessario, alla liberazione e alla rivendita dell'immobile. Il primo colloquio è riservato e senza impegno.",
      ]}
      steps={[
        { n: "01", title: "Analisi del fascicolo", text: "Perizia CTU, avviso di vendita, occupazione, gravami e conformità: verifica completa." },
        { n: "02", title: "Numeri e rischi", text: "Prezzo massimo sostenibile, costi accessori, tempi di liberazione e rendimento atteso." },
        { n: "03", title: "Offerta o trattativa", text: "Deposito cauzionale e partecipazione alla gara, oppure saldo e stralcio con banca o fondo." },
        { n: "04", title: "Chiusura", text: "Decreto di trasferimento, liberazione dell'immobile e, se richiesta, rivendita o messa a reddito." },
      ]}
      perche={[
        { title: "Riservatezza totale", text: "Le situazioni debitorie si trattano con discrezione: nessun dato esce dal nostro studio." },
        { title: "Rete di professionisti", text: "Legali, tecnici e istituti di credito coordinati da un unico referente." },
        { title: "Nessun costo nascosto", text: "Condizioni definite per iscritto prima di iniziare, senza anticipi sulla speranza di un esito." },
      ]}
      faqs={faqs}
      ctaText="Hai ricevuto un pignoramento o vuoi valutare un immobile all'asta? Parliamone in modo riservato: la prima consulenza è gratuita."
    />
  );
}
