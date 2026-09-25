import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight, ImageOff, MapPin } from "lucide-react";
import { useState } from "react";

import { ScrollReveal } from "@/components/ScrollReveal";
import { SiteHeader } from "@/components/SiteHeader";
import { caricaImmobile } from "@/lib/properties/queries";
import { luogoBreve, type ImmobilePubblico } from "@/lib/properties/types";

export const Route = createFileRoute("/immobili/$slug")({
  // Uno slug sconosciuto (o un immobile uscito dal feed) deve rispondere 404,
  // non 200 con "non disponibile": un soft 404 resta nell'indice di Google.
  loader: async ({ params }) => {
    const immobile = await caricaImmobile({ data: params.slug });
    if (!immobile) throw notFound();
    return immobile;
  },
  component: SchedaImmobile,
  notFoundComponent: NonTrovato,
  head: ({ loaderData }) => {
    const immobile = loaderData as ImmobilePubblico | undefined;
    if (!immobile) {
      return {
        meta: [
          { title: "Immobile non disponibile | Matrice Real Estate" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const luogo = luogoBreve(immobile);
    const descrizione =
      `${immobile.tipologiaEtichetta ?? "Immobile"} a ${luogo}` +
      (immobile.superficie !== null ? `, ${immobile.superficie} m²` : "") +
      (immobile.locali !== null ? `, ${immobile.locali} locali` : "") +
      `. ${immobile.prezzoEtichetta}.` +
      (immobile.riferimento ? ` Rif. ${immobile.riferimento}.` : "");

    return {
      meta: [
        { title: `${immobile.titolo} — ${immobile.prezzoEtichetta} | Matrice Real Estate` },
        { name: "description", content: descrizione },
        { property: "og:title", content: immobile.titolo },
        { property: "og:description", content: descrizione },
        { property: "og:url", content: `/immobili/${immobile.slug}` },
        ...(immobile.copertina ? [{ property: "og:image", content: immobile.copertina }] : []),
      ],
      links: [{ rel: "canonical", href: `/immobili/${immobile.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: immobile.titolo,
            description: descrizione,
            url: `/immobili/${immobile.slug}`,
            ...(immobile.copertina ? { image: immobile.copertina } : {}),
            ...(immobile.prezzo !== null
              ? {
                  offers: {
                    "@type": "Offer",
                    price: immobile.prezzo,
                    priceCurrency: "EUR",
                    availability: "https://schema.org/InStock",
                  },
                }
              : {}),
            about: {
              "@type": "Accommodation",
              ...(immobile.superficie !== null
                ? {
                    floorSize: {
                      "@type": "QuantitativeValue",
                      value: immobile.superficie,
                      unitCode: "MTK",
                    },
                  }
                : {}),
              ...(immobile.locali !== null ? { numberOfRooms: immobile.locali } : {}),
              ...(immobile.bagni !== null ? { numberOfBathroomsTotal: immobile.bagni } : {}),
              address: {
                "@type": "PostalAddress",
                // Solo cio' che e' pubblicabile: con indirizzo nascosto qui
                // resta la sola localita'.
                ...(immobile.indirizzo.completo
                  ? { streetAddress: immobile.indirizzo.completo }
                  : {}),
                ...(immobile.indirizzo.cap ? { postalCode: immobile.indirizzo.cap } : {}),
                ...(immobile.indirizzo.comune
                  ? { addressLocality: immobile.indirizzo.comune }
                  : {}),
                addressCountry: "IT",
              },
            },
            broker: {
              "@type": "RealEstateAgent",
              name: "Matrice Real Estate",
              telephone: "+39 345 760 3610",
              email: "info@matricerealestate.it",
            },
          }),
        },
      ],
    };
  },
});

/* ------------------------------------------------------------- galleria */

function Galleria({ immobile }: { immobile: ImmobilePubblico }) {
  const [attiva, setAttiva] = useState(0);
  const foto = immobile.immagini;

  if (foto.length === 0) {
    return (
      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] text-foreground/35">
        <ImageOff className="size-8" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
          Foto non disponibili
        </span>
      </div>
    );
  }

  const principale = foto[attiva] ?? foto[0];
  if (!principale) return null;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/5">
        <img
          src={principale.url}
          alt={`${immobile.titolo} — foto ${attiva + 1} di ${foto.length}`}
          width={principale.width ?? undefined}
          height={principale.height ?? undefined}
          className="aspect-[16/10] w-full object-cover"
        />
      </div>

      {foto.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {foto.map((f, i) => (
            <button
              key={f.id ?? `${f.url}-${i}`}
              type="button"
              onClick={() => setAttiva(i)}
              aria-label={`Mostra foto ${i + 1}`}
              aria-current={i === attiva}
              className={
                "overflow-hidden rounded-lg border transition-colors " +
                (i === attiva ? "border-flame" : "border-white/15 hover:border-white/40")
              }
            >
              <img src={f.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- scheda */

function Riga({ etichetta, valore }: { etichetta: string; valore: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <dt className="text-sm text-foreground/60">{etichetta}</dt>
      <dd className="text-right text-sm font-medium">{valore}</dd>
    </div>
  );
}

function SchedaImmobile() {
  const immobile = Route.useLoaderData();

  const righe: { etichetta: string; valore: string }[] = [];
  const aggiungi = (etichetta: string, valore: string | number | null) => {
    if (valore !== null && valore !== undefined && valore !== "") {
      righe.push({ etichetta, valore: String(valore) });
    }
  };

  aggiungi("Tipologia", immobile.tipologiaEtichetta);
  aggiungi("Sottotipo", immobile.sottotipo);
  aggiungi("Superficie", immobile.superficie !== null ? `${immobile.superficie} m²` : null);
  aggiungi("Superficie utile", immobile.superficieUtile !== null ? `${immobile.superficieUtile} m²` : null);
  aggiungi("Terreno", immobile.superficieTerreno !== null ? `${immobile.superficieTerreno} m²` : null);
  aggiungi("Locali", immobile.locali);
  aggiungi("Camere", immobile.camere);
  aggiungi("Bagni", immobile.bagni);
  aggiungi("Piano", immobile.piano);
  aggiungi("Piani edificio", immobile.pianiEdificio);
  aggiungi("Anno di costruzione", immobile.annoCostruzione);
  aggiungi(
    "Classe energetica",
    immobile.classeEnergetica === "UNKNOWN" ? null : immobile.classeEnergetica,
  );
  aggiungi(
    "Spese condominiali",
    immobile.speseCondominio !== null ? `${immobile.speseCondominio} €/mese` : null,
  );
  aggiungi("Cauzione", immobile.cauzione);
  aggiungi("Riferimento", immobile.riferimento);

  const oggetto = `Richiesta informazioni — ${immobile.titolo}${
    immobile.riferimento ? ` (rif. ${immobile.riferimento})` : ""
  }`;

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
            <Link to="/immobili" className="transition-colors hover:text-flame">
              Immobili
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground/70">
              {immobile.tipologiaEtichetta ?? "Scheda"}
            </span>
          </nav>

          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-flame">
                {immobile.operazioneEtichetta}
              </span>
              <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.6rem]">
                {immobile.titolo}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-base font-light text-foreground/70">
                <MapPin className="size-4 shrink-0 text-flame" aria-hidden="true" />
                {immobile.indirizzo.completo
                  ? `${immobile.indirizzo.completo} — ${luogoBreve(immobile)}`
                  : luogoBreve(immobile)}
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <span className="font-display text-4xl tracking-tight lg:text-5xl">
                {immobile.prezzoEtichetta}
              </span>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80} className="mt-10">
          <Galleria immobile={immobile} />
        </ScrollReveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            {immobile.descrizione ? (
              <ScrollReveal>
                <h2 className="font-display text-2xl tracking-tight lg:text-3xl">Descrizione</h2>
                {/* Il testo arriva dal feed: viene reso come testo, mai come
                    HTML, cosi' non e' possibile iniettare markup o script. */}
                <div className="mt-5 space-y-4 text-base font-light leading-relaxed text-foreground/75">
                  {immobile.descrizione
                    .split(/\n+/)
                    .filter((p) => p.trim() !== "")
                    .map((paragrafo, i) => (
                      <p key={i}>{paragrafo}</p>
                    ))}
                </div>
              </ScrollReveal>
            ) : null}

            {immobile.dotazioni.length > 0 ? (
              <ScrollReveal delay={80} className="mt-10">
                <h2 className="font-display text-2xl tracking-tight lg:text-3xl">Dotazioni</h2>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {immobile.dotazioni.map((d) => (
                    <li
                      key={d}
                      className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-foreground/80"
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            ) : null}

            {immobile.indirizzo.coordinate ? (
              <ScrollReveal delay={120} className="mt-10">
                <h2 className="font-display text-2xl tracking-tight lg:text-3xl">Posizione</h2>
                <p className="mt-4 text-base font-light text-foreground/70">
                  {immobile.indirizzo.civico === null
                    ? "Posizione indicativa: su richiesta del proprietario il civico non viene pubblicato."
                    : "Posizione dell'immobile."}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${immobile.indirizzo.coordinate.lat},${immobile.indirizzo.coordinate.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-colors hover:border-flame hover:text-flame"
                >
                  Apri su Google Maps <ArrowUpRight className="size-4" />
                </a>
              </ScrollReveal>
            ) : null}
          </div>

          <aside className="lg:col-span-5">
            <ScrollReveal>
              <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.12] to-white/[0.04] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:sticky lg:top-28 lg:p-8">
                <h2 className="font-display text-xl tracking-tight">Caratteristiche</h2>
                <dl className="mt-5">
                  {righe.map((r) => (
                    <Riga key={r.etichetta} {...r} />
                  ))}
                </dl>

                <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
                  <Link
                    to="/"
                    search={{ oggetto }}
                    hash="contatti"
                    className="flex w-full items-center justify-center rounded-full bg-foreground px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
                  >
                    Richiedi informazioni
                  </Link>
                  <a
                    href={`https://wa.me/393457603610?text=${encodeURIComponent(
                      `Salve, sono interessato a: ${immobile.titolo}${
                        immobile.riferimento ? ` (rif. ${immobile.riferimento})` : ""
                      }`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-colors hover:border-flame hover:text-flame"
                  >
                    Scrivi su WhatsApp <ArrowUpRight className="size-3.5" />
                  </a>
                </div>

                {immobile.aggiornatoIl ? (
                  <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/40">
                    Aggiornato il{" "}
                    {new Date(immobile.aggiornatoIl).toLocaleDateString("it-IT")}
                  </p>
                ) : null}
              </div>
            </ScrollReveal>
          </aside>
        </div>

        <ScrollReveal delay={80}>
          <div className="mt-16 border-t border-white/10 pt-8">
            <Link
              to="/immobili"
              className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/70 transition-colors hover:text-flame"
            >
              Torna a tutti gli immobili
            </Link>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}

function NonTrovato() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-4xl tracking-tight lg:text-5xl">
          Immobile non disponibile
        </h1>
        <p className="mt-5 text-base font-light leading-relaxed text-foreground/70">
          Questa scheda non e piu online: l&apos;immobile potrebbe essere stato
          venduto, affittato o ritirato dal mercato.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            to="/immobili"
            className="rounded-full bg-foreground px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
          >
            Vedi gli immobili disponibili
          </Link>
          <a
            href="/#contatti"
            className="rounded-full border border-white/25 px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-flame hover:text-flame"
          >
            Contattaci
          </a>
        </div>
      </main>
    </div>
  );
}
