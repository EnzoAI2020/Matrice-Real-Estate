import { defineMcp } from "@lovable.dev/mcp-js";
import companyInfoTool from "./tools/company-info";
import listServicesTool from "./tools/list-services";
import listTeamTool from "./tools/list-team";

export default defineMcp({
  name: "matrice-group-elevated-real-estate",
  title: "Matrice Real Estate: Elevated Real Estate",
  version: "0.1.0",
  instructions:
    "Dati pubblici di Matrice Real Estate (mediazione immobiliare, consulenza e investimenti, Napoli). Usa `company_info` per profilo e credenziali, `list_services` per servizi e tipologie commerciali, `list_team_and_partners` per team e rete di partner.",
  tools: [companyInfoTool, listServicesTool, listTeamTool],
});
