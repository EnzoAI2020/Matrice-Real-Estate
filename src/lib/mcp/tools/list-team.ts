import { defineTool } from "@lovable.dev/mcp-js";

const team = [
  { name: "Michele Pone", role: "Agente immobiliare · Titolare" },
  { name: "Valentina Infantozzi", role: "Agente immobiliare · Architetto" },
  { name: "Giuseppe Di Giacomo", role: "Ingegnere" },
  { name: "Matteo Leoncini", role: "Consulente aste immobiliari" },
  { name: "Corrado Predellini", role: "NPL Specialist" },
];

const partner = [
  "Premaca Srl",
  "Milgauss RE Srl",
  "Reattivo NPL",
  "Studio 081 Architects & Partners",
  "Caliendo Group",
  "Project & Construction Srl",
  "Nova Service Srl",
  "La Contessa Immobiliare Srl",
];

export default defineTool({
  name: "list_team_and_partners",
  title: "Team e partner",
  description:
    "Elenca i professionisti del team Matrice Real Estate e la rete di partner specializzati.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify({ team, partner }) }],
    structuredContent: { team, partner },
  }),
});
