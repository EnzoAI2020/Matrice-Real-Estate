import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { useMemo, useState } from "react";

import { ScrollReveal } from "@/components/ScrollReveal";
import { SiteHeader } from "@/components/SiteHeader";
import { caricaElencoImmobili } from "@/lib/properties/queries";
import {
  luogoBreve,
  sintesi,
  type ImmobilePubblico,
  type Operazione,
} from "@/lib/properties/types";

export const Route = createFileRoute("/immobili/")({
  loader: async () => caricaElencoImmobili({ data: {} }),
  component: ElencoImmobiliPagina,
  head: () => ({
    meta: [
      { title: "Immobili in vendita e in affitto a Napoli | Matrice Real Estate" },
      {
        name: "description",
        content:
          "Appartamenti, ville, uffici e locali commerciali seguiti da Matrice Real Estate a Napoli. Schede aggiornate ogni giorno con superficie, classe energetica e foto.",
      },
      { property: "og:title", content: "Immobili disponibili — Matrice Real Estate Napoli" },
      {
        property: "og:description",
        content:
          "Il portafoglio immobiliare di Matrice Real Estate a Napoli: compravendita, locazioni e investimenti.",
      },
      { property: "og:url", content: "/immobili" },
    ],
    links: [{ rel: "canonical", href: "/immobili" }],
  }),
});

/* ------------------------------------------------------------------ card */

function SenzaFoto() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white/[0.04] text-foreground/35">
      <ImageOff className="size-7" aria-hidden="true" />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
        Foto non disponibile
      </span>
    </div>
  );
}

function CardImmobile({ immobile }: { immobile: ImmobilePubblico }) {
  const dettagli = sintesi(immobile);

  return (
    <Link
      to="/immobili/$slug"
      params={{ slug: immobile.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.12] to-white/[0.04] shadow-[0_8px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:from-white/[0.18] hover:to-white/[0.07]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {immobile.copertina ? (
          <img
            src={immobile.copertina}
            alt={immobile.titolo}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <SenzaFoto />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm">
          {immobile.operazioneEtichetta}
        </span>
        {immobile.classeEnergetica && immobile.classeEnergetica !== "UNKNOWN" ? (
          <span className="absolute right-4 top-4 rounded-full bg-flame/90 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-flame-foreground backdrop-blur-sm">
            Classe {immobile.classeEnergetica}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-7">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-flame">
          {immobile.tipologiaEtichetta ?? "Immobile"}
        </span>
        <h2 className="mt-3 font-display text-2xl leading-tight tracking-tight transition-colors group-hover:text-flame">
          {luogoBreve(immobile)}
        </h2>
        {immobile.indirizzo.completo ? (
          <p className="mt-1.5 text-sm font-light text-foreground/60">
            {immobile.indirizzo.completo}
          </p>
        ) : null}

        {dettagli.length > 0 ? (
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/70">
            {dettagli.map((d, i) => (
              <span key={d} className="flex items-center gap-3">
                {i > 0 ? <span aria-hidden="true" className="text-foreground/25">·</span> : null}
                {d}
              </span>
            ))}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/10 pt-5">
          <span className="font-display text-2xl tracking-tight">
            {immobile.prezzoEtichetta}
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-flame group-hover:text-flame-foreground">
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* --------------------------------------------------------------- pagina */

const SELECT =
  "min-h-11 rounded-full border border-white/20 bg-white/[0.06] px-5 py-2.5 text-sm text-foreground backdrop-blur-sm transition-colors hover:border-white/35 focus:border-flame focus:outline-none";

function ElencoImmobiliPagina() {
  const dati = Route.useLoaderData();

  const [operazione, setOperazione] = useState<Operazione | "TUTTE">("TUTTE");
  const [tipologia, setTipologia] = useState<string>("TUTTE");
  const [comune, setComune] = useState<string>("TUTTI");

  // I filtri agiscono sul risultato gia' caricato: il portafoglio e' piccolo
  // e cosi' l'interazione e' immediata, senza un viaggio al server per click.
  const risultati = useMemo(
    () =>
      dati.immobili.filter((i) => {
        if (operazione !== "TUTTE" && i.operazione !== operazione) return false;
        if (tipologia !== "TUTTE" && i.tipologia !== tipologia) return false;
        if (comune !== "TUTTI" && i.indirizzo.comune !== comune) return false;
        return true;
      }),
    [dati.immobili, operazione, tipologia, comune],
  );

  const etichettaOperazione: Record<Operazione, string> = {
    sale: "Vendita",
    rent: "Affitto",
    rent_to_own: "Affitto con riscatto",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-[1600px] px-5 pb-20 pt-28 sm:px-6 lg:px-12 lg:pb-32 lg:pt-40">
        <ScrollReveal>
          <nav
            aria-label="Percorso"
            className="mb-8 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45"
          >
            <Link to="/" className="transition-colors hover:text-flame">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground/70">Immobili</span>
          </nav>

          <h1 className="max-w-4xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-[4.2rem]">
            Immobili disponibili a Napoli
          </h1>
          <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-foreground/70 lg:text-lg">
            Le proprieta seguite direttamente da Matrice Real Estate. Ogni
            scheda riporta superficie, classe energetica e riferimento interno.
          </p>
        </ScrollReveal>

        {!dati.disponibile ? (
          <StatoNonDisponibile />
        ) : dati.immobili.length === 0 ? (
          <StatoVuoto />
        ) : (
          <>
            <ScrollReveal delay={80}>
              <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-white/10 py-5">
                <label className="sr-only" htmlFor="f-operazione">
                  Operazione
                </label>
                <select
                  id="f-operazione"
                  value={operazione}
                  onChange={(e) => setOperazione(e.target.value as Operazione | "TUTTE")}
                  className={SELECT}
                >
                  <option value="TUTTE">Tutte le operazioni</option>
                  {dati.opzioni.operazioni.map((o) => (
                    <option key={o} value={o}>
                      {etichettaOperazione[o]}
                    </option>
                  ))}
                </select>

                <label className="sr-only" htmlFor="f-tipologia">
                  Tipologia
                </label>
                <select
                  id="f-tipologia"
                  value={tipologia}
                  onChange={(e) => setTipologia(e.target.value)}
                  className={SELECT}
                >
                  <option value="TUTTE">Tutte le tipologie</option>
                  {dati.opzioni.tipologie.map((t) => (
                    <option key={t.valore} value={t.valore}>
                      {t.etichetta}
                    </option>
                  ))}
                </select>

                {dati.opzioni.comuni.length > 1 ? (
                  <>
                    <label className="sr-only" htmlFor="f-comune">
                      Comune
                    </label>
                    <select
                      id="f-comune"
                      value={comune}
                      onChange={(e) => setComune(e.target.value)}
                      className={SELECT}
                    >
                      <option value="TUTTI">Tutti i comuni</option>
                      {dati.opzioni.comuni.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </>
                ) : null}

                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                  {risultati.length} {risultati.length === 1 ? "immobile" : "immobili"}
                </span>
              </div>
            </ScrollReveal>

            {risultati.length === 0 ? (
              <p className="mt-16 text-center text-foreground/60">
                Nessun immobile corrisponde ai filtri selezionati.
              </p>
            ) : (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {risultati.map((immobile, i) => (
                  <ScrollReveal key={immobile.id} delay={(i % 3) * 80} className="h-full">
                    <CardImmobile immobile={immobile} />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </>
        )}

        <ScrollReveal delay={120}>
          <div className="mt-20 rounded-3xl border border-white/15 bg-white/[0.03] px-6 py-10 text-center sm:px-10 lg:py-14">
            <h2 className="font-display text-3xl leading-tight tracking-tight lg:text-4xl">
              Non trovi quello che cerchi?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base font-light text-foreground/70">
              Raccontaci cosa stai cercando: una parte del portafoglio non e
              pubblicata online.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="/#contatti"
                className="rounded-full bg-foreground px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
              >
                Scrivici
              </a>
              <a
                href="https://www.immobiliare.it/pro/382689/pone/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-flame hover:text-flame"
              >
                Vetrina Immobiliare.it <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}

function Pannello({ titolo, testo }: { titolo: string; testo: string }) {
  return (
    <div className="mt-12 rounded-3xl border border-white/15 bg-white/[0.03] px-6 py-14 text-center sm:px-10">
      <h2 className="font-display text-2xl tracking-tight lg:text-3xl">{titolo}</h2>
      <p className="mx-auto mt-4 max-w-xl text-base font-light leading-relaxed text-foreground/70">
        {testo}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          href="https://www.immobiliare.it/pro/382689/pone/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
        >
          Guarda su Immobiliare.it <ArrowUpRight className="size-4" />
        </a>
        <a
          href="/#contatti"
          className="rounded-full border border-white/25 px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-flame hover:text-flame"
        >
          Parlaci della tua ricerca
        </a>
      </div>
    </div>
  );
}

function StatoVuoto() {
  return (
    <Pannello
      titolo="Nessun immobile pubblicato in questo momento"
      testo="Il portafoglio e in aggiornamento. Nel frattempo puoi consultare la vetrina Immobiliare.it oppure scriverci: seguiamo anche ricerche su incarico."
    />
  );
}

function StatoNonDisponibile() {
  return (
    <Pannello
      titolo="Elenco temporaneamente non disponibile"
      testo="Non riusciamo a caricare le schede in questo momento. Riprova fra poco, oppure contattaci direttamente: rispondiamo anche su WhatsApp."
    />
  );
}
