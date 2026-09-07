import { createFileRoute } from "@tanstack/react-router";
import { ServicePage, faqJsonLd } from "@/components/ServicePage";
import hero from "@/assets/hero-villa.jpg";

const faqs = [
  {
    q: "Quanto costa il servizio di mediazione immobiliare?",
    a: "La provvigione viene concordata prima dell'incarico ed è dovuta solo a compravendita conclusa. Valutazione dell'immobile, servizio fotografico e piano di promozione sono inclusi, senza costi anticipati.",
  },
  {
    q: "Come viene stabilito il prezzo di vendita?",
    a: "Analizziamo le compravendite realmente concluse nella zona negli ultimi dodici mesi, lo stato dell'immobile, la classe energetica e i tempi medi di assorbimento del mercato locale. Il risultato è una forbice di prezzo realistica, non una stima gonfiata per ottenere l'incarico.",
  },
  {
    q: "Quali documenti servono per vendere casa a Napoli?",
    a: "Atto di provenienza, visura e planimetria catastale aggiornate, attestato di prestazione energetica, titoli edilizi e, se presente, il regolamento condominiale. Verifichiamo noi la conformità urbanistica e catastale prima di mettere l'immobile sul mercato.",
  },
  {
    q: "Quanto tempo serve per vendere un immobile?",
    a: "Con un prezzo allineato al mercato, gli immobili residenziali a Napoli e provincia si vendono mediamente in tre-sei mesi. I capannoni e gli spazi commerciali richiedono tempi più lunghi, ma con una platea di investitori più selezionata.",
  },
];

export const Route = createFileRoute("/compravendita")({
  head: () => ({
    meta: [
      { title: "Compravendita immobiliare Napoli | Matrice Group" },
      {
        name: "description",
        content:
          "Agenzia immobiliare a Napoli per la compravendita di case, capannoni e immobili commerciali: valutazione gratuita, verifica documentale e assistenza fino al rogito.",
      },
      { property: "og:title", content: "Compravendita immobiliare a Napoli — Matrice Group" },
      {
        property: "og:description",
        content:
          "Vendere o comprare casa, capannoni e negozi a Napoli e provincia con una mediazione trasparente: valutazione, marketing, trattativa e rogito.",
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
      eyebrow="Servizio / Compravendita"
      title="Vendere e comprare"
      titleItalic="senza sorprese"
      intro="Mediazione immobiliare a Napoli e provincia per abitazioni, capannoni e spazi commerciali: un solo interlocutore dalla valutazione al rogito."
      image={hero}
      imageAlt="Immobile residenziale di pregio nel golfo di Napoli"
      paragrafi={[
        "La compravendita è il momento in cui un patrimonio cambia forma. Per questo Matrice Group tratta ogni incarico come un progetto a sé: prima di parlare di prezzo, ricostruiamo la storia dell'immobile, la sua situazione documentale e il profilo di acquirente più probabile. È il lavoro che riduce le trattative infinite e le sorprese davanti al notaio.",
        "Operiamo su tre fronti che di solito richiedono agenzie diverse: il residenziale a Napoli città e nei comuni della provincia, il commerciale — negozi, spazi retail, superfici per catene della grande distribuzione — e l'industriale, con capannoni e aree logistiche. Questa visione trasversale ci permette di intercettare acquirenti che un'agenzia specializzata su un solo segmento non incontra mai.",
        "Per chi vende, il punto di partenza è una valutazione onesta. Confrontiamo i dati delle compravendite realmente concluse in zona, non i prezzi richiesti negli annunci, e costruiamo un piano di promozione con servizio fotografico professionale, annunci sui portali, presentazione riservata al nostro network di investitori e, dove opportuno, contatto diretto con operatori del settore. Ogni due settimane ricevi un resoconto di visite, contatti e feedback ricevuti.",
        "Per chi compra, il valore è nella verifica preventiva: conformità urbanistica e catastale, provenienza, ipoteche, spese condominiali, vincoli e destinazione d'uso. Controlliamo tutto prima della proposta, così l'offerta che presenti è già solida. Se l'acquisto richiede un mutuo, ti affianchiamo nel confronto tra istituti e nella preparazione della pratica.",
        "La trattativa la gestiamo noi, per iscritto e con trasparenza verso entrambe le parti: proposta, accettazione, compromesso, verifica delle condizioni sospensive e rogito. Al momento dell'atto avrai già visto ogni documento che il notaio leggerà.",
      ]}
      steps={[
        { n: "01", title: "Valutazione", text: "Sopralluogo, analisi dei comparabili e forbice di prezzo realistica, messa per iscritto." },
        { n: "02", title: "Verifica documenti", text: "Catasto, urbanistica, provenienza, APE e vincoli: tutto controllato prima della pubblicazione." },
        { n: "03", title: "Promozione", text: "Foto professionali, portali, network di investitori e contatti diretti con operatori." },
        { n: "04", title: "Trattativa e rogito", text: "Proposta, compromesso e assistenza fino alla firma davanti al notaio." },
      ]}
      perche={[
        { title: "Un solo referente", text: "Dalla prima telefonata al rogito parli sempre con la stessa persona." },
        { title: "Rete FIAIP", text: "Iscrizione FIAIP e C.C.I.A.A. Napoli n. 424903: mediazione regolare e tracciabile." },
        { title: "Residenziale e commerciale", text: "Un'unica squadra per case, negozi e capannoni: più acquirenti raggiunti." },
      ]}
      faqs={faqs}
      ctaText="Vuoi sapere quanto vale davvero il tuo immobile? Richiedi una valutazione gratuita: rispondiamo entro 24 ore."
    />
  );
}
