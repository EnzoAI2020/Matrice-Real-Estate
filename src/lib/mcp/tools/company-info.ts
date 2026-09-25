import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "company_info",
  title: "Informazioni aziendali",
  description:
    "Restituisce le informazioni pubbliche di Matrice Real Estate: profilo, credenziali e recapiti.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify({
          nome: "Matrice Real Estate",
          settore: "Real Estate & Consulting",
          payoff: "Il valore di un immobile. La sicurezza di una scelta.",
          descrizione:
            "Mediazione immobiliare, consulenza tecnica, fiscale e legale, aste giudiziarie, NPL e investimenti internazionali. Operiamo su tutto il territorio nazionale grazie alla collaborazione con altre agenzie.",
          fondata: "2011",
          iscrizione:
            "Ruolo degli Agenti di affari in mediazione presso la C.C.I.A.A. di Napoli, n. 424903 (titolare: Sig. Michele Pone). Aderisce alla FIAIP.",
          sede: "Napoli, Italia",
          contatti: { telefono: null, email: null, indirizzo: null },
        }),
      },
    ],
  }),
});
