import { defineTool } from "@lovable.dev/mcp-js";

const servizi = [
  {
    n: "01",
    title: "Compravendita",
    text: "Supporto professionale nella vendita e nell'acquisto, dalla valutazione alla conclusione della trattativa.",
  },
  {
    n: "02",
    title: "Locazioni",
    text: "Assistenza nella ricerca, valutazione e gestione delle operazioni di locazione immobiliare.",
  },
  {
    n: "03",
    title: "Valutazioni",
    text: "Analisi del mercato e dei valori immobiliari grazie a una rete di collaborazione sul territorio nazionale.",
  },
  {
    n: "04",
    title: "Aste e NPL",
    text: "Assistenza e consulenza per aste giudiziarie, immobili da fallimenti, saldo e stralcio e operazioni NPL.",
  },
  {
    n: "05",
    title: "Investimenti internazionali",
    text: "Un team di professionisti affianca l'investitore dall'acquisto alla gestione del patrimonio immobiliare.",
  },
  {
    n: "06",
    title: "Consulenza globale",
    text: "Consulenza tecnica, fiscale, legale e commerciale per affrontare ogni passaggio con maggiore consapevolezza.",
  },
];

const tipologieCommerciali = [
  {
    tag: "Capannoni e logistica",
    text: "Vendita e locazione di capannoni industriali e poli logistici su tutto il territorio nazionale.",
  },
  {
    tag: "Grande distribuzione",
    text: "Superfici commerciali per la grande distribuzione organizzata: supermercati, discount e retail park.",
  },
  {
    tag: "Locali commerciali",
    text: "Negozi e locali commerciali in posizioni strategiche, valutati con dati di mercato reali.",
  },
];

export default defineTool({
  name: "list_services",
  title: "Elenco servizi",
  description:
    "Elenca i servizi immobiliari di Matrice Group e le tipologie di immobili commerciali trattate (capannoni, retail, locali).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      { type: "text", text: JSON.stringify({ servizi, tipologieCommerciali }) },
    ],
    structuredContent: { servizi, tipologieCommerciali },
  }),
});
