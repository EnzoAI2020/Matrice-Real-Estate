import { createFileRoute } from "@tanstack/react-router";

import { elencaImmobili } from "@/lib/properties/repository.server";
import type { FiltriImmobili, Operazione } from "@/lib/properties/types";

/**
 * GET /api/properties
 *
 * Restituisce SOLO immobili attivi e SOLO campi pubblici: l'indirizzo esatto
 * e le coordinate degli annunci con indirizzo nascosto non escono da qui,
 * perche' il repository non li legge nemmeno.
 *
 * Filtri: operation, type, city, minPrice, maxPrice, minArea, maxArea,
 *         limit, offset
 */

const OPERAZIONI: Operazione[] = ["sale", "rent", "rent_to_own"];

function numero(valore: string | null): number | undefined {
  if (!valore) return undefined;
  const n = Number(valore);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function testo(valore: string | null, lunghezzaMax = 80): string | undefined {
  if (!valore) return undefined;
  const v = valore.trim().slice(0, lunghezzaMax);
  return v === "" ? undefined : v;
}

export const Route = createFileRoute("/api/properties")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const p = url.searchParams;

        const operazioneGrezza = testo(p.get("operation"), 20);
        const filtri: FiltriImmobili = {};

        if (operazioneGrezza && OPERAZIONI.includes(operazioneGrezza as Operazione)) {
          filtri.operazione = operazioneGrezza as Operazione;
        }
        const tipologia = testo(p.get("type"), 40);
        if (tipologia) filtri.tipologia = tipologia;
        const comune = testo(p.get("city"));
        if (comune) filtri.comune = comune;

        const prezzoMin = numero(p.get("minPrice"));
        if (prezzoMin !== undefined) filtri.prezzoMin = prezzoMin;
        const prezzoMax = numero(p.get("maxPrice"));
        if (prezzoMax !== undefined) filtri.prezzoMax = prezzoMax;
        const superficieMin = numero(p.get("minArea"));
        if (superficieMin !== undefined) filtri.superficieMin = superficieMin;
        const superficieMax = numero(p.get("maxArea"));
        if (superficieMax !== undefined) filtri.superficieMax = superficieMax;

        const limite = numero(p.get("limit"));
        if (limite !== undefined) filtri.limite = limite;
        const offset = numero(p.get("offset"));
        if (offset !== undefined) filtri.offset = offset;

        const esito = await elencaImmobili(filtri);

        return new Response(JSON.stringify(esito), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            // Il feed cambia una volta al giorno: una cache breve basta.
            "Cache-Control": "public, max-age=300, s-maxage=900",
          },
        });
      },
    },
  },
});
