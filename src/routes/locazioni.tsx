import { createFileRoute } from "@tanstack/react-router";
import { ServicePage, faqJsonLd } from "@/components/ServicePage";
import hero from "@/assets/retail.jpg";

const faqs = [
  {
    q: "Che differenza c'è tra cedolare secca e regime ordinario?",
    a: "La cedolare secca applica un'imposta fissa sul canone e sostituisce IRPEF, addizionali, imposta di registro e bollo, ma impedisce l'aggiornamento ISTAT del canone. Il regime ordinario tassa il canone secondo l'aliquota IRPEF. La convenienza dipende dal reddito complessivo del proprietario: facciamo il confronto numerico prima della firma.",
  },
  {
    q: "Come vi tutelate dal rischio di morosità?",
    a: "Selezioniamo il conduttore verificando reddito, continuità lavorativa o bilanci in caso di azienda, e proponiamo garanzie adeguate: deposito cauzionale, fideiussione bancaria o assicurativa, polizza sui canoni. Nessun inquilino entra nell'immobile senza queste verifiche.",
  },
  {
    q: "Quali sono le durate dei contratti commerciali?",
    a: "Per le attività commerciali la durata legale è 6+6 anni, per quelle alberghiere 9+9. Il canone può essere modulato con periodi di free rent iniziali o scalettature concordate, soprattutto per superfici retail e capannoni che richiedono investimenti di allestimento.",
  },
  {
    q: "Vi occupate anche della gestione dopo la firma?",
    a: "Sì. Registrazione telematica del contratto, rinnovi, aggiornamenti ISTAT, verbali di consegna e riconsegna, rapporti con l'amministratore e gestione delle criticità con il conduttore: possiamo seguire l'immobile per tutta la durata della locazione.",
  },
];

export const Route = createFileRoute("/locazioni")({
  head: () => ({
    meta: [
      { title: "Locazioni immobiliari Napoli: case, negozi e capannoni | Matrice Group" },
      {
        name: "description",
        content:
          "Affitto di appartamenti, locali commerciali e capannoni a Napoli e provincia: selezione del conduttore, contratti a norma, cedolare secca e gestione della locazione.",
      },
      { property: "og:title", content: "Locazioni immobiliari a Napoli — Matrice Group" },
      {
        property: "og:description",
        content:
          "Affittare casa, negozio o capannone a Napoli con inquilini verificati, contratti registrati e canoni tutelati.",
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
      eyebrow="Servizio / Locazioni"
      title="Affittare"
      titleItalic="con tranquillità"
      intro="Locazioni residenziali e commerciali a Napoli e provincia: conduttori selezionati, contratti a norma e canoni che arrivano puntuali."
      image={hero}
      imageAlt="Spazio commerciale retail in locazione"
      paragrafi={[
        "Una locazione riuscita non è quella firmata più in fretta: è quella che dura senza problemi. Il rischio vero, per un proprietario, non è l'immobile sfitto per qualche settimana in più, ma un conduttore inadeguato che genera morosità, contenziosi e mesi di procedura per rientrare in possesso dell'immobile. Tutto il nostro metodo nasce da questa premessa.",
        "Seguiamo locazioni residenziali a Napoli città e nei comuni della provincia, e locazioni commerciali di negozi, superfici retail per catene della grande distribuzione, uffici e capannoni logistici. Su ogni immobile definiamo prima il canone di mercato reale, incrociando i contratti registrati in zona con la domanda effettiva del momento, poi il profilo di conduttore che vogliamo raggiungere.",
        "La selezione è la fase più delicata. Per il residenziale verifichiamo busta paga o dichiarazione dei redditi, continuità del rapporto di lavoro e referenze; per il commerciale analizziamo visura, bilanci e solidità del progetto imprenditoriale. Solo dopo proponiamo le garanzie più adatte: deposito cauzionale, fideiussione bancaria o assicurativa, polizza a copertura dei canoni.",
        "Il contratto viene costruito sulla situazione concreta: canone libero 4+4, concordato 3+2 con i benefici fiscali dei patti territoriali, transitorio, per studenti, oppure 6+6 e 9+9 per le attività commerciali. Valutiamo insieme la convenienza della cedolare secca con un confronto numerico, non con una raccomandazione generica, e gestiamo registrazione telematica, verbale di consegna con lettura dei contatori e documentazione fotografica dello stato dei luoghi.",
        "Dopo la firma il rapporto non finisce: seguiamo rinnovi, disdette, aggiornamenti ISTAT, subentri e riconsegna dell'immobile, intervenendo alle prime avvisaglie di criticità, quando un problema si risolve ancora con una telefonata invece che con un legale.",
      ]}
      steps={[
        { n: "01", title: "Canone di mercato", text: "Analisi dei contratti registrati in zona e definizione del canone sostenibile." },
        { n: "02", title: "Selezione", text: "Verifica di redditi, bilanci e referenze del conduttore prima di ogni proposta." },
        { n: "03", title: "Contratto", text: "Forma contrattuale, garanzie, cedolare secca e registrazione telematica." },
        { n: "04", title: "Gestione", text: "Rinnovi, ISTAT, verbali e assistenza per tutta la durata della locazione." },
      ]}
      perche={[
        { title: "Zero canoni a vuoto", text: "Garanzie e verifiche preventive per ridurre al minimo il rischio di morosità." },
        { title: "Residenziale e retail", text: "Dalla singola abitazione alla superficie per la grande distribuzione." },
        { title: "Assistenza continua", text: "Non spariamo dopo la firma: seguiamo il contratto fino alla riconsegna." },
      ]}
      faqs={faqs}
      ctaText="Hai un immobile sfitto o cerchi uno spazio da prendere in locazione? Raccontaci la tua situazione, ti proponiamo la formula più adatta."
    />
  );
}
