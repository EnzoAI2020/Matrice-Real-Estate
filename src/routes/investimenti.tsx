import { createFileRoute } from "@tanstack/react-router";
import { ServicePage, faqJsonLd } from "@/components/ServicePage";
import hero from "@/assets/capannone.jpg";

const faqs = [
  {
    q: "Con quale capitale si può iniziare a investire nel mattone?",
    a: "A Napoli e provincia esistono operazioni residenziali da riqualificare a partire da poche decine di migliaia di euro, mentre capannoni e superfici retail a reddito richiedono capitali più consistenti. Prima di parlare di immobili definiamo il capitale disponibile, l'orizzonte temporale e la tolleranza al rischio.",
  },
  {
    q: "Che rendimento è realistico attendersi?",
    a: "Dipende dal segmento: una locazione residenziale ben impostata rende tipicamente meno di un capannone o di uno spazio retail affittato a un operatore della grande distribuzione con contratto pluriennale, mentre le operazioni di riqualificazione e rivendita puntano sulla plusvalenza. Presentiamo sempre un conto economico con costi, imposte e tempi, mai una percentuale isolata.",
  },
  {
    q: "Seguite anche investimenti immobiliari all'estero?",
    a: "Sì, affianchiamo chi vuole diversificare su mercati internazionali attraverso partner locali selezionati, occupandoci della valutazione preliminare dell'operazione e del coordinamento con i professionisti del Paese di riferimento per gli aspetti fiscali e notarili.",
  },
  {
    q: "Che differenza c'è tra investire nel residenziale e nel commerciale?",
    a: "Il residenziale è più liquido e comprensibile, con canoni più bassi e maggiore rotazione degli inquilini. Il commerciale e l'industriale offrono contratti lunghi 6+6 o 9+9 e conduttori strutturati, ma richiedono capitali maggiori e un'analisi accurata della domanda della zona. Molti portafogli equilibrati contengono entrambi.",
  },
];

export const Route = createFileRoute("/investimenti")({
  head: () => ({
    meta: [
      { title: "Investimenti immobiliari a Napoli e internazionali | Matrice Group" },
      {
        name: "description",
        content:
          "Consulenza per investimenti immobiliari a Napoli e all'estero: selezione di immobili a reddito, capannoni, retail e operazioni di riqualificazione con analisi dei rendimenti.",
      },
      { property: "og:title", content: "Investimenti immobiliari a Napoli — Matrice Group" },
      {
        property: "og:description",
        content:
          "Immobili a reddito, capannoni, spazi commerciali e operazioni di riqualificazione: strategia, numeri e gestione dell'investimento.",
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
      eyebrow="Servizio / Investimenti"
      title="Investire nel"
      titleItalic="mattone giusto"
      intro="Selezione di immobili a reddito, capannoni e operazioni di riqualificazione a Napoli e provincia, con apertura ai mercati internazionali."
      image={hero}
      imageAlt="Capannone logistico oggetto di investimento immobiliare"
      paragrafi={[
        "Investire nel mattone non significa comprare un immobile e sperare che si rivaluti. Significa scegliere un'operazione con numeri verificabili, sapere in anticipo quanto costa mantenerla, quanto rende al netto delle imposte e in quanto tempo si può uscire. Matrice Group lavora esattamente su questo: trasformare un'intenzione di investimento in un piano con cifre e scadenze.",
        "Il percorso comincia dal profilo, non dall'immobile. Definiamo insieme capitale disponibile, eventuale leva bancaria, orizzonte temporale, esigenza di flusso di cassa mensile o di plusvalenza a scadenza, e livello di rischio accettabile. Solo dopo passiamo alla ricerca: senza questa fase si finisce per acquistare ciò che è disponibile invece di ciò che serve.",
        "Le operazioni che seguiamo più spesso sono quattro. Immobili residenziali a reddito nelle zone di Napoli con domanda locativa stabile. Superfici commerciali e retail affittate o affittabili a operatori strutturati della grande distribuzione, con contratti 6+6 e conduttori solidi. Capannoni e spazi logistici nell'hinterland, dove la domanda è sostenuta dalla crescita dell'e-commerce. Operazioni di riqualificazione e rivendita, spesso originate da aste giudiziarie e posizioni NPL, dove il valore si crea con il lavoro e non con l'attesa.",
        "Per chi vuole diversificare oltre confine affianchiamo investimenti immobiliari internazionali, appoggiandoci a partner locali selezionati e coordinando i professionisti che seguono gli aspetti fiscali e notarili del Paese di destinazione. Anche in questo caso la regola non cambia: prima i numeri, poi la decisione.",
        "Ogni proposta arriva con un conto economico completo — prezzo, imposte, costi di intervento, spese di gestione, canone atteso, rendimento lordo e netto, ipotesi di uscita — e con l'indicazione onesta di ciò che può andare storto. Dopo l'acquisto possiamo occuparci della messa a reddito, della gestione della locazione e, quando è il momento giusto, della rivendita.",
      ]}
      steps={[
        { n: "01", title: "Profilo", text: "Capitale, leva, orizzonte temporale e obiettivo: reddito o plusvalenza." },
        { n: "02", title: "Scouting", text: "Selezione di immobili sul mercato, off-market, da asta o da posizioni NPL." },
        { n: "03", title: "Due diligence", text: "Verifiche tecniche, urbanistiche e documentali con conto economico dell'operazione." },
        { n: "04", title: "Gestione e uscita", text: "Messa a reddito, gestione del conduttore e strategia di rivendita." },
      ]}
      perche={[
        { title: "Numeri prima di tutto", text: "Nessuna operazione presentata senza un conto economico completo e verificabile." },
        { title: "Accesso off-market", text: "Immobili che non arrivano sui portali, da rete professionale, aste e NPL." },
        { title: "Respiro internazionale", text: "Diversificazione all'estero con partner locali selezionati." },
      ]}
      faqs={faqs}
      ctaText="Vuoi capire quale operazione è adatta al tuo capitale? Fissiamo un incontro e costruiamo insieme il piano d'investimento."
    />
  );
}
