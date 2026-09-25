/**
 * Funzioni server usate dai loader delle pagine.
 *
 * createServerFn garantisce che il corpo giri SOLO sul server: il
 * repository (e quindi D1 / node:sqlite) non finisce mai nel bundle del
 * browser. Le pagine ricevono solo oggetti gia' ripuliti.
 */

import { createServerFn } from "@tanstack/react-start";

import {
  elencaImmobili,
  immobilePerSlug,
  ultimaSincronizzazione,
} from "./repository.server";
import type {
  ElencoImmobili,
  FiltriImmobili,
  ImmobilePubblico,
  Operazione,
  StatoSincronizzazione,
} from "./types";

const OPERAZIONI = new Set(["sale", "rent", "rent_to_own"]);

/** Ripulisce i filtri in arrivo dal client: nulla passa cosi' com'e'. */
function filtriSicuri(grezzo: unknown): FiltriImmobili {
  const f = (grezzo ?? {}) as Record<string, unknown>;
  const out: FiltriImmobili = {};

  if (typeof f["operazione"] === "string" && OPERAZIONI.has(f["operazione"])) {
    out.operazione = f["operazione"] as Operazione;
  }
  if (typeof f["tipologia"] === "string" && f["tipologia"].length <= 40) {
    out.tipologia = f["tipologia"];
  }
  if (typeof f["comune"] === "string" && f["comune"].length <= 80) {
    out.comune = f["comune"];
  }
  for (const chiave of ["prezzoMin", "prezzoMax", "superficieMin", "superficieMax"] as const) {
    const v = f[chiave];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) out[chiave] = v;
  }
  return out;
}

export const caricaElencoImmobili = createServerFn({ method: "GET" })
  .validator(filtriSicuri)
  .handler(async ({ data }): Promise<ElencoImmobili> => elencaImmobili(data));

export const caricaImmobile = createServerFn({ method: "GET" })
  .validator((grezzo: unknown): string => {
    const slug = typeof grezzo === "string" ? grezzo : String((grezzo as { slug?: string })?.slug ?? "");
    return slug.slice(0, 120);
  })
  .handler(async ({ data }): Promise<ImmobilePubblico | null> => immobilePerSlug(data));

export const caricaStatoSync = createServerFn({ method: "GET" }).handler(
  async (): Promise<StatoSincronizzazione | null> => ultimaSincronizzazione(),
);
