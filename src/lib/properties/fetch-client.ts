import type { ElencoImmobili } from "./types";

/**
 * Carica l'elenco degli immobili DAL BROWSER.
 *
 * Perche' non la server function: il sito pubblicato e' statico e non ha un
 * server. Alla prima apertura di una pagina i dati sono gia' dentro l'HTML,
 * ma appena si naviga da un link il loader riparte nel browser e la server
 * function non ha nessuno a cui parlare.
 *
 * Si legge quindi il file generato dall'export. In sviluppo quel file non
 * esiste e si ripiega sulla rotta /api/properties, che li' c'e'.
 */
export async function caricaElencoDalBrowser(): Promise<ElencoImmobili> {
  const vuoto: ElencoImmobili = {
    immobili: [],
    totale: 0,
    disponibile: false,
    opzioni: { tipologie: [], comuni: [], operazioni: [] },
  };

  for (const url of ["/api/properties.json", "/api/properties"]) {
    try {
      const risposta = await fetch(url, { headers: { Accept: "application/json" } });
      if (!risposta.ok) continue;
      return (await risposta.json()) as ElencoImmobili;
    } catch {
      // Si prova il percorso successivo.
    }
  }
  return vuoto;
}
