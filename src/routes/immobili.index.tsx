import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { immobili, formatPrezzo, type Tipologia } from "@/data/immobili";

export const Route = createFileRoute("/immobili/")({
  component: ImmobiliPage,
  head: () => ({
    meta: [
      { title: "Immobili in vendita a Napoli e provincia — Matrice Group" },
      {
        name: "description",
        content:
          "Listino immobili Matrice Group: appartamenti e ville, capannoni e superfici commerciali, immobili da aste giudiziarie e operazioni NPL a Napoli e provincia.",
      },
      { property: "og:title", content: "Immobili — Matrice Group" },
      {
        property: "og:description",
        content:
          "Residenziale, commerciale, aste e NPL: il listino di Matrice Group a Napoli e provincia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/immobili" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Immobili Matrice Group",
          itemListElement: immobili.map((im, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            item: {
              "@type": "Product",
              name: im.titolo,
              category: im.tipologia,
              url: `/immobili/${im.slug}`,
              offers: {
                "@type": "Offer",
                priceCurrency: "EUR",
                ...(im.prezzo !== null
                  ? { price: im.prezzo, availability: "https://schema.org/InStock" }
                  : { availability: "https://schema.org/LimitedAvailability" }),
              },
            },
          })),
        }),
      },
    ],
  }),
});

const tipologie: (Tipologia | "Tutti")[] = ["Tutti", "Residenziale", "Commerciale", "NPL-Asta"];

const fasce = [
  { id: "tutte", label: "Tutte le fasce", test: () => true },
  { id: "sotto-500", label: "< 500.000 €", test: (p: number | null) => p !== null && p < 500000 },
  {
    id: "500-1500",
    label: "500.000 – 1.500.000 €",
    test: (p: number | null) => p !== null && p >= 500000 && p <= 1500000,
  },
  { id: "oltre-1500", label: "> 1.500.000 €", test: (p: number | null) => p !== null && p > 1500000 },
  { id: "richiesta", label: "Su richiesta", test: (p: number | null) => p === null },
] as const;

function ImmobiliPage() {
  const [tipologia, setTipologia] = useState<(typeof tipologie)[number]>("Tutti");
  const [fascia, setFascia] = useState<(typeof fasce)[number]["id"]>("tutte");

  const risultati = useMemo(() => {
    const f = fasce.find((x) => x.id === fascia)!;
    return immobili.filter(
      (im) => (tipologia === "Tutti" || im.tipologia === tipologia) && f.test(im.prezzo),
    );
  }, [tipologia, fascia]);

  return (
    <div className="min-h-svh bg-background text-foreground antialiased">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 lg:px-12">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            MATRICE<span className="font-light italic opacity-70">GROUP</span>
          </Link>
          <a
            href="https://wa.me/393457603610"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-foreground px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
          >
            Parla con noi
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-16 lg:px-12 lg:py-24">
        <p className="mb-6 flex items-center gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-flame">
          <span className="h-px w-10 bg-flame" />
          Listino immobili
        </p>
        <h1 className="font-display text-[11vw] leading-[0.95] tracking-tight lg:text-[6rem]">
          Immobili <span className="font-light italic text-flame">selezionati</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg font-light text-foreground/70">
          Residenziale, commerciale e operazioni da aste e NPL a Napoli e provincia. Ogni immobile
          è seguito dal nostro team dalla valutazione al rogito.
        </p>

        <a
          href="https://www.immobiliare.it/pro/382689/pone/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/80 transition-colors hover:border-flame hover:text-flame"
        >
          Guarda tutti gli annunci su Immobiliare.it <ArrowUpRight className="size-4" />
        </a>

        {/* FILTRI */}
        <div className="mt-12 flex flex-col gap-6 rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              Tipologia
            </span>
            {tipologie.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipologia(t)}
                aria-pressed={tipologia === t}
                className={`rounded-full border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  tipologia === t
                    ? "border-flame bg-flame text-flame-foreground"
                    : "border-white/15 text-foreground/70 hover:border-flame/50 hover:text-flame"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              Prezzo
            </span>
            {fasce.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFascia(f.id)}
                aria-pressed={fascia === f.id}
                className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  fascia === f.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-white/15 text-foreground/70 hover:border-flame/50 hover:text-flame"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          ( {risultati.length} immobili )
        </p>

        {/* GRIGLIA */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {risultati.map((im) => (
            <Link
              key={im.slug}
              to="/immobili/$slug"
              params={{ slug: im.slug }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-card transition-colors hover:border-flame/40"
            >
              <div className="relative overflow-hidden">
                <img
                  src={im.copertina}
                  alt={im.titolo}
                  width={1600}
                  height={1000}
                  loading="lazy"
                  className="aspect-8/5 w-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-flame backdrop-blur-md">
                  {im.tipologia}
                </span>
                <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-background/60 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/80 backdrop-blur-md">
                  {im.stato}
                </span>
              </div>
              <div className="p-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {im.zona}
                </p>
                <h2 className="mt-3 font-display text-2xl leading-tight tracking-tight transition-colors group-hover:text-flame">
                  {im.titolo}
                </h2>
                <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {im.mq.toLocaleString("it-IT")} mq
                    </p>
                    <p className="mt-1 font-display text-xl">{formatPrezzo(im.prezzo)}</p>
                  </div>
                  <ArrowRight className="size-5 text-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-flame" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {risultati.length === 0 && (
          <p className="mt-16 text-center font-light text-muted-foreground">
            Nessun immobile corrisponde ai filtri selezionati.
          </p>
        )}
      </main>
    </div>
  );
}
