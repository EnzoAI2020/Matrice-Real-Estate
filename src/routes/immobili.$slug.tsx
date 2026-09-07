import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getImmobile, formatPrezzo } from "@/data/immobili";

export const Route = createFileRoute("/immobili/$slug")({
  loader: ({ params }) => {
    const immobile = getImmobile(params.slug);
    if (!immobile) throw notFound();
    return { immobile };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Immobile non disponibile — Matrice Group" }, { name: "robots", content: "noindex" }],
      };
    }
    const { immobile } = loaderData;
    const description = `${immobile.tipologia} · ${immobile.zona} · ${immobile.mq} mq · ${formatPrezzo(immobile.prezzo)}`;
    return {
      meta: [
        { title: `${immobile.titolo} — Matrice Group` },
        { name: "description", content: description },
        { property: "og:title", content: `${immobile.titolo} — Matrice Group` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: immobile.titolo,
            category: immobile.tipologia,
            description: immobile.descrizione[0],
            offers: {
              "@type": "Offer",
              priceCurrency: "EUR",
              ...(immobile.prezzo !== null
                ? { price: immobile.prezzo, availability: "https://schema.org/InStock" }
                : { availability: "https://schema.org/LimitedAvailability" }),
              seller: { "@type": "RealEstateAgent", name: "Matrice Group" },
            },
          }),
        },
      ],
    };
  },
  notFoundComponent: ImmobileNonTrovato,
  component: DettaglioImmobile,
});

function ImmobileNonTrovato() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <h1 className="font-display text-4xl">Immobile non disponibile</h1>
      <Link
        to="/immobili"
        className="rounded-full bg-foreground px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
      >
        Torna al listino
      </Link>
    </div>
  );
}

function DettaglioImmobile() {
  const { immobile } = Route.useLoaderData();

  return (
    <div className="min-h-svh bg-background text-foreground antialiased">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 lg:px-12">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            MATRICE<span className="font-light italic opacity-70">GROUP</span>
          </Link>
          <Link
            to="/immobili"
            className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:text-flame"
          >
            <ArrowLeft className="size-4" /> Listino
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-14 lg:px-12 lg:py-20">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-flame">
          {immobile.tipologia} · {immobile.stato}
        </p>
        <h1 className="mt-5 font-display text-[9vw] leading-[0.98] tracking-tight lg:text-[4.5rem]">
          {immobile.titolo}
        </h1>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          {immobile.zona} · {immobile.mq.toLocaleString("it-IT")} mq · {formatPrezzo(immobile.prezzo)}
        </p>

        {/* GALLERIA */}
        <Carousel className="mt-12" opts={{ loop: true }}>
          <CarouselContent>
            {immobile.galleria.map((img, i) => (
              <CarouselItem key={i}>
                <img
                  src={img}
                  alt={`${immobile.titolo} — foto ${i + 1}`}
                  width={1600}
                  height={1000}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="aspect-16/9 w-full rounded-2xl border border-white/10 object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 border-white/20 bg-background/70 text-foreground backdrop-blur-md hover:bg-flame hover:text-flame-foreground" />
          <CarouselNext className="right-4 border-white/20 bg-background/70 text-foreground backdrop-blur-md hover:bg-flame hover:text-flame-foreground" />
        </Carousel>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl tracking-tight">Descrizione</h2>
            <div className="mt-5 space-y-5 leading-relaxed text-muted-foreground">
              {immobile.descrizione.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <h2 className="mt-14 font-display text-3xl tracking-tight">Caratteristiche</h2>
            <dl className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {immobile.caratteristiche.map((c) => (
                <div key={c.label} className="bg-background/85 p-6">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.25em] text-flame">
                    {c.label}
                  </dt>
                  <dd className="mt-2 text-foreground/85">{c.value}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-14 font-display text-3xl tracking-tight">Zona</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">{immobile.mappa}</p>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-10 rounded-2xl border border-white/10 bg-card/70 p-8 backdrop-blur-xl lg:p-10">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-flame">
                Richiedi informazioni
              </p>
              <p className="mt-5 font-display text-3xl">{formatPrezzo(immobile.prezzo)}</p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Fissa una visita o richiedi la documentazione completa: un nostro consulente ti
                risponde entro 24 ore.
              </p>
              <Link
                to="/"
                hash="contatti"
                search={{ oggetto: immobile.titolo }}
                className="mt-8 block rounded-full bg-foreground px-8 py-4 text-center font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
              >
                Contattaci per questo immobile
              </Link>
              <div className="mt-5 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
                <a
                  href="tel:+393457603610"
                  className="rounded-full border border-white/15 px-4 py-2 transition-colors hover:border-flame hover:text-flame"
                >
                  345 760 3610
                </a>
                <a
                  href={`https://wa.me/393457603610?text=${encodeURIComponent(`Salve, sono interessato a: ${immobile.titolo}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-flame/50 px-4 py-2 text-flame transition-colors hover:bg-flame hover:text-flame-foreground"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
