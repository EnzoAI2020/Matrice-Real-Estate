import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import heroVilla from "@/assets/hero-villa.jpg";
import interior from "@/assets/interior.jpg";
import palazzo from "@/assets/palazzo.jpg";
import capannone from "@/assets/capannone.jpg";
import retail from "@/assets/retail.jpg";
import commerciale from "@/assets/commerciale.jpg";
import fiaip from "@/assets/fiaip.png.asset.json";
import teamMichele from "@/assets/team-michele.jpg";
import teamValentina from "@/assets/team-valentina.jpg";
import teamGiuseppe from "@/assets/team-giuseppe.jpg";
import teamMatteo from "@/assets/team-matteo.jpg";
import teamCorrado from "@/assets/team-corrado.jpg";
import logo from "@/assets/logo-matrice.png";

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: Record<string, unknown>): { oggetto?: string } => {
    const oggetto = search["oggetto"];
    return typeof oggetto === "string" ? { oggetto } : {};
  },
  head: () => ({
    meta: [
      { title: "Matrice Group — Mediazione Immobiliare, Consulenza e Investimenti" },
      {
        name: "description",
        content:
          "Matrice Group: mediazione immobiliare, consulenza tecnica e legale, aste giudiziarie, NPL e investimenti internazionali. Dal 2011, C.C.I.A.A. Napoli n. 424903.",
      },
      { property: "og:title", content: "Matrice Group — Real Estate & Consulting" },
      {
        property: "og:description",
        content:
          "Il valore di un immobile. La sicurezza di una scelta. Compravendita, locazioni, valutazioni, aste e NPL, investimenti internazionali.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: "Matrice Group",
          description:
            "Mediazione immobiliare, consulenza tecnica, fiscale e legale, aste giudiziarie, NPL e investimenti internazionali.",
          areaServed: "IT",
          foundingDate: "2011",
          telephone: "+39 345 760 3610",
          email: "info@matricegroup.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Via di Villanova 16",
            addressLocality: "Napoli",
            addressCountry: "IT",
          },
        }),
      },
    ],
  }),
});

const servizi = [
  {
    n: "01",
    title: "Compravendita",
    text: "Supporto professionale nella vendita e nell'acquisto, dalla valutazione alla conclusione della trattativa.",
  },
  {
    n: "02",
    title: "Locazioni",
    text: "Assistenza nella ricerca, valutazione e gestione delle operazioni di locazione immobiliare.",
  },
  {
    n: "03",
    title: "Valutazioni",
    text: "Analisi del mercato e dei valori immobiliari grazie a una rete di collaborazione sul territorio nazionale.",
  },
  {
    n: "04",
    title: "Aste e NPL",
    text: "Assistenza e consulenza per aste giudiziarie, immobili da fallimenti, saldo e stralcio e operazioni NPL.",
  },
  {
    n: "05",
    title: "Investimenti internazionali",
    text: "Un team di professionisti affianca l'investitore dall'acquisto alla gestione del patrimonio immobiliare.",
  },
  {
    n: "06",
    title: "Consulenza globale",
    text: "Consulenza tecnica, fiscale, legale e commerciale per affrontare ogni passaggio con maggiore consapevolezza.",
  },
];

const team = [
  { name: "Michele Pone", role: "Agente immobiliare · Titolare", img: teamMichele },
  { name: "Valentina Infantozzi", role: "Agente immobiliare · Architetto", img: teamValentina },
  { name: "Giuseppe Di Giacomo", role: "Ingegnere", img: teamGiuseppe },
  { name: "Matteo Leoncini", role: "Consulente aste immobiliari", img: teamMatteo },
  { name: "Corrado Predellini", role: "NPL Specialist", img: teamCorrado },
];

const partner = [
  "Premaca Srl",
  "Milgauss RE Srl",
  "Reattivo NPL",
  "Avv. Salvatore Arciuolo",
  "Studio Notarile Cante",
  "Caliendo Group",
  "Project & Construction Srl",
  "Nova Service Srl",
  "La Contessa Immobiliare Srl",
];

const marqueeWords = [
  "MEDIAZIONE",
  "CONSULENZA",
  "INVESTIMENTI",
  "ASTE E NPL",
  "VALUTAZIONI",
  "LOCAZIONI",
];

function Index() {
  const { oggetto } = Route.useSearch();
  return (
    <div className="bg-background text-foreground antialiased">
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 lg:px-12">
          <a href="#top" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo Matrice Group"
              width={452}
              height={480}
              className="h-10 w-auto"
            />
            <span className="font-display text-2xl font-bold tracking-tight">
              MATRICE<span className="font-light italic opacity-70">GROUP</span>
            </span>
          </a>
          <nav className="hidden items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/80 lg:flex">
            <a href="#chi-siamo" className="px-3 py-2 transition-colors hover:text-flame">
              Chi siamo
            </a>
            <Link to="/compravendita" className="px-3 py-2 transition-colors hover:text-flame">
              Compravendita
            </Link>
            <Link to="/locazioni" className="px-3 py-2 transition-colors hover:text-flame">
              Locazioni
            </Link>
            <Link to="/aste-e-npl" className="px-3 py-2 transition-colors hover:text-flame">
              Aste e NPL
            </Link>
            <Link to="/investimenti" className="px-3 py-2 transition-colors hover:text-flame">
              Investimenti
            </Link>
            <Link to="/immobili" className="px-3 py-2 transition-colors hover:text-flame">
              Immobili
            </Link>
            <a href="#team" className="px-3 py-2 transition-colors hover:text-flame">
              Team
            </a>
          </nav>
          <a
            href="#contatti"
            className="rounded-full bg-foreground px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground lg:px-8 lg:py-4 lg:text-[11px]"
          >
            Parla con noi
          </a>
        </div>
      </header>

      {/* HERO — full-bleed cinematic */}
      <section id="top" className="relative flex min-h-svh flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroVilla}
            alt="Polo logistico industriale moderno con facciata in vetro al tramonto"
            width={1920}
            height={1088}
            className="h-full w-full animate-hero-zoom object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/10 to-background" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/5 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 pt-40 pb-14 lg:px-12">
          <p className="mb-8 flex items-center gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-flame animate-reveal">
            <span className="h-px w-10 bg-flame" />
            Mediazione immobiliare · Consulenza · Investimenti — Dal 2011
          </p>

          <h1 className="font-display text-[13vw] leading-[0.92] tracking-tight lg:text-[8.5rem]">
            <span className="block animate-reveal">Il valore di un immobile.</span>
            <span className="block animate-reveal font-light italic text-foreground/90 [animation-delay:150ms]">
              La sicurezza di una scelta.
            </span>
          </h1>

          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between animate-reveal [animation-delay:300ms]">
            <p className="max-w-md text-lg font-light leading-relaxed text-foreground/75">
              Matrice Group accompagna privati e investitori in ogni fase della trattativa, con
              professionalità, riservatezza e una rete di professionisti qualificati.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#contatti"
                className="rounded-full bg-foreground px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
              >
                Parla con noi
              </a>
              <a
                href="#servizi"
                className="rounded-full border border-white/25 px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground backdrop-blur-sm transition-colors hover:border-flame hover:text-flame"
              >
                Scopri i servizi
              </a>
            </div>
          </div>

          {/* Glass stats */}
          <div className="mt-14 grid gap-4 md:grid-cols-3 animate-reveal [animation-delay:450ms]">
            {[
              { k: "13+", v: "Anni di attività" },
              { k: "05", v: "Professionisti in team" },
              { k: "09", v: "Partner in rete nazionale" },
            ].map((s) => (
              <div
                key={s.v}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition-colors hover:bg-white/10"
              >
                <p className="font-display text-4xl">{s.k}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50">
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-white/10 py-5">
        <div className="flex w-max animate-marquee whitespace-nowrap font-display text-2xl font-light italic tracking-wide text-foreground/60">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex">
              {marqueeWords.map((w) => (
                <span key={w} className="flex items-center">
                  <span className="px-8">{w}</span>
                  <span className="text-flame not-italic">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* CHI SIAMO */}
      <section id="chi-siamo" className="mx-auto max-w-[1600px] px-6 py-24 lg:px-12 lg:py-32">
        <div className="mb-14 flex items-end justify-between gap-6">
          <h2 className="font-display text-[10vw] leading-[0.95] tracking-tight lg:text-[5.5rem]">
            Un team, un metodo,
            <br />
            <span className="font-light italic text-flame">una visione globale.</span>
          </h2>
          <span className="hidden shrink-0 max-w-xs text-right font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block">
            ( Chi siamo — Seguiamo il cliente dal primo incontro fino ai servizi post rogito o post contratto d'affitto )
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-card p-10 lg:col-span-5 lg:p-12">
            <div>
              <p className="text-xl font-light leading-relaxed text-foreground/85">
                Matrice Group nasce come punto di origine solido e strutturato da cui si
                sviluppano competenze diverse: mediazione immobiliare, consulenza tecnica e legale,
                aste giudiziarie e investimenti.
              </p>
              <p className="mt-6 leading-relaxed text-muted-foreground">
                Il nome richiama precisione e affidabilità, il termine “Group” ne rappresenta il
                respiro ampio: una struttura professionale capace di muoversi su ambiti complessi,
                dal residenziale al business, senza fermarsi a una singola nicchia.
              </p>
              <p className="mt-6 leading-relaxed text-muted-foreground">
                Operiamo nel ramo della mediazione immobiliare da diversi anni, avvalendoci della
                collaborazione di professionisti esperti e qualificati nel settore. Siamo in grado
                di offrire consulenza tecnica, fiscale, legale e commerciale per consentire alla
                nostra clientela di effettuare la compravendita o la locazione del proprio immobile
                con le massime garanzie di sicurezza e tranquillità.
              </p>
            </div>
            <div className="mt-10 flex items-center gap-6 border-t border-white/10 pt-8">
              <img
                src={fiaip.url}
                alt="Badge FIAIP — Michele Pone, Federazione Italiana Agenti Immobiliari Professionali"
                width={96}
                height={96}
                loading="lazy"
                className="size-24 shrink-0 rounded-full bg-white p-1.5 object-contain"
              />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-flame">
                  Iscrizione al ruolo
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Matrice Group, nella persona del titolare Sig. Michele Pone, è iscritta al Ruolo
                  degli Agenti di affari in mediazione presso la C.C.I.A.A. di Napoli al n.{" "}
                  <span className="font-display text-lg text-foreground">424903</span> e aderisce
                  alla FIAIP.
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl lg:col-span-7">
            <img
              src={interior}
              alt="Interno di un capannone industriale moderno con struttura in acciaio"
              width={1600}
              height={1008}
              loading="lazy"
              className="h-full min-h-[360px] w-full object-cover transition-transform duration-[2s] group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-8 pt-20">
              <p className="font-display text-2xl font-light italic">
                “Seguire il cliente in ogni passo, dal primo incontro al post rogito.”
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 p-8 lg:col-span-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-flame">
              / Rete nazionale
            </span>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Grazie alla collaborazione con altre agenzie operiamo su tutto il territorio
              nazionale, conoscendo i valori degli immobili e garantendo valutazioni il più
              possibile attendibili.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-8 lg:col-span-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-flame">
              / Aste e stralci
            </span>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Offriamo assistenza e consulenza globale a chi desidera acquistare un immobile
              tramite asta giudiziale, da un fallimento o attraverso operazioni di saldo e
              stralcio. Nel campo degli investimenti internazionali lavoriamo in stretta
              collaborazione con professionisti di comprovata esperienza e capacità.
            </p>
          </div>

          <div className="rounded-2xl bg-flame p-8 text-flame-foreground lg:col-span-12">
            <p className="font-display text-2xl font-light leading-snug lg:text-3xl">
              “La nostra priorità è seguire il cliente in ogni passo, garantendo sicurezza e
              tranquillità nella trattativa immobiliare.”
            </p>
          </div>
        </div>
      </section>

      {/* SERVIZI — over palazzo backdrop */}
      <section id="servizi" className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0">
          <img
            src={palazzo}
            alt=""
            width={1200}
            height={1504}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/88" />
        </div>
        <div className="relative mx-auto max-w-[1600px] px-6 lg:px-12">
          <div className="mb-14 flex items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-[10vw] leading-[0.95] tracking-tight lg:text-[5.5rem]">
                Cosa <span className="font-light italic text-flame">facciamo</span>
              </h2>
              <p className="mt-4 max-w-lg text-lg font-light text-foreground/70">
                Servizi immobiliari costruiti intorno alle tue esigenze.
              </p>
            </div>
            <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block">
              ( 06 servizi )
            </span>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {servizi.map((s) => (
              <article
                key={s.n}
                className="group bg-background/85 p-10 backdrop-blur-sm transition-colors duration-500 hover:bg-white/5"
              >
                <span className="font-mono text-[11px] text-flame">/ {s.n}</span>
                <h3 className="mt-4 font-display text-3xl tracking-tight transition-colors group-hover:text-flame">
                  {s.title}
                </h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{s.text}</p>
                <ArrowRight className="mt-6 size-5 text-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-flame" />
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/immobili"
              className="inline-flex items-center gap-3 rounded-full border border-white/15 px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-flame hover:text-flame"
            >
              Vedi il listino <ArrowRight className="size-4" />
            </Link>
            <a
              href="https://www.immobiliare.it/pro/382689/pone/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/80 transition-colors hover:border-flame hover:text-flame"
            >
              Guarda tutti gli annunci su Immobiliare.it <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* COMMERCIALE — capannoni, retail, locali */}
      <section id="commerciale" className="mx-auto max-w-[1600px] px-6 py-24 lg:px-12 lg:py-32">
        <div className="mb-14 flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-[10vw] leading-[0.95] tracking-tight lg:text-[5.5rem]">
              Dal residenziale{" "}
              <span className="font-light italic text-flame">al commerciale</span>
            </h2>
            <p className="mt-4 max-w-lg text-lg font-light text-foreground/70">
              Capannoni industriali, grandi superfici di vendita e locali commerciali: mettiamo a
              reddito ogni tipologia di immobile.
            </p>
          </div>
          <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block">
            ( Immobili commerciali )
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              img: capannone,
              alt: "Capannone industriale moderno con piazzale al tramonto",
              tag: "Capannoni e logistica",
              text: "Vendita e locazione di capannoni industriali e poli logistici su tutto il territorio nazionale.",
            },
            {
              img: retail,
              alt: "Grande superficie di vendita con parcheggio all'ora blu",
              tag: "Grande distribuzione",
              text: "Superfici commerciali per la grande distribuzione organizzata: supermercati, discount e retail park.",
            },
            {
              img: commerciale,
              alt: "Locale commerciale con vetrine in centro città di sera",
              tag: "Locali commerciali",
              text: "Negozi e locali commerciali in posizioni strategiche, valutati con dati di mercato reali.",
            },
          ].map((c) => (
            <figure
              key={c.tag}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-card"
            >
              <div className="overflow-hidden">
                <img
                  src={c.img}
                  alt={c.alt}
                  width={1600}
                  height={1000}
                  loading="lazy"
                  className="aspect-8/5 w-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
              </div>
              <figcaption className="p-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-flame">
                  / {c.tag}
                </p>
                <p className="mt-3 leading-relaxed text-muted-foreground">{c.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/immobili"
            className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
          >
            Vedi il listino <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="mx-auto max-w-[1600px] px-6 py-24 lg:px-12 lg:py-32">
        <div className="mb-14 flex items-end justify-between gap-6">
          <h2 className="font-display text-[10vw] leading-[0.95] tracking-tight lg:text-[5.5rem]">
            Il <span className="font-light italic text-flame">team</span>
          </h2>
          <span className="hidden shrink-0 max-w-xs text-right font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:block">
            Competenze diverse, un unico obiettivo.
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {team.map((m) => (
            <figure
              key={m.name}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-card"
            >
              <div className="overflow-hidden">
                <img
                  src={m.img}
                  alt={`Ritratto di ${m.name}`}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="aspect-4/5 w-full object-cover grayscale transition-all duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
                />
              </div>
              <figcaption className="p-6">
                <p className="font-display text-xl tracking-tight">{m.name}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {m.role}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* PARTNER */}
      <section id="partner" className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12 lg:pb-32">
        <div className="mb-10">
          <h2 className="font-display text-[8vw] leading-[0.95] tracking-tight lg:text-[4rem]">
            Una rete di collaborazioni{" "}
            <span className="font-light italic text-flame">specialistiche</span>
          </h2>
          <p className="mt-4 max-w-lg text-lg font-light text-foreground/70">
            Collaboriamo con realtà e professionisti che ampliano le competenze disponibili per i
            nostri clienti.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
          {partner.map((p) => (
            <div
              key={p}
              className="flex min-h-28 items-center justify-center bg-background px-6 py-8 text-center font-display text-lg font-light tracking-wide text-foreground/60 transition-colors duration-500 hover:bg-white/5 hover:text-flame"
            >
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* CONTATTI */}
      <section id="contatti" className="border-t border-white/10 py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-6">
            <h2 className="font-display text-[10vw] leading-[0.95] tracking-tight lg:text-[5rem]">
              Parliamo del tuo{" "}
              <span className="font-light italic text-flame">prossimo progetto.</span>
            </h2>
            <p className="mt-8 max-w-md text-lg font-light leading-relaxed text-muted-foreground">
              Raccontaci l'operazione: un referente del team ti ricontatta con una prima
              valutazione.
            </p>
            <dl className="mt-12 space-y-5 font-mono text-[11px] uppercase tracking-[0.2em]">
              <div className="flex gap-4 border-t border-white/10 pt-5">
                <dt className="w-24 shrink-0 text-muted-foreground">Telefono</dt>
                <dd className="flex flex-wrap items-center gap-3">
                  <a href="tel:+393457603610" className="transition-colors hover:text-flame">
                    345 760 3610
                  </a>
                  <a
                    href="https://wa.me/393457603610"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-flame/50 px-3 py-1 text-[9px] text-flame transition-colors hover:bg-flame hover:text-flame-foreground"
                  >
                    WhatsApp
                  </a>
                </dd>
              </div>
              <div className="flex gap-4 border-t border-white/10 pt-5">
                <dt className="w-24 shrink-0 text-muted-foreground">Email</dt>
                <dd>
                  <a
                    href="mailto:info@matricegroup.com"
                    className="lowercase transition-colors hover:text-flame"
                  >
                    info@matricegroup.com
                  </a>
                </dd>
              </div>
              <div className="flex gap-4 border-t border-white/10 pt-5">
                <dt className="w-24 shrink-0 text-muted-foreground">Indirizzo</dt>
                <dd>Via di Villanova 16, Napoli</dd>
              </div>
            </dl>
          </div>

          <form
            className="rounded-2xl border border-white/10 bg-card p-10 lg:col-span-6 lg:p-12"
            onSubmit={(e) => e.preventDefault()}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-flame">
              Richiedi informazioni
            </p>
            <div className="mt-10 space-y-7">
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  Nome e cognome
                </span>
                <input
                  type="text"
                  placeholder="Il tuo nome"
                  className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-foreground placeholder:text-foreground/30 focus:border-flame focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  placeholder="nome@dominio.it"
                  className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-foreground placeholder:text-foreground/30 focus:border-flame focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  Oggetto
                </span>
                <input
                  type="text"
                  name="oggetto"
                  defaultValue={oggetto ?? ""}
                  placeholder="Compravendita, valutazione, aste…"
                  className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-foreground placeholder:text-foreground/30 focus:border-flame focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  Messaggio
                </span>
                <textarea
                  rows={3}
                  placeholder="Come possiamo aiutarti?"
                  className="mt-2 w-full resize-none border-b border-white/15 bg-transparent py-3 text-foreground placeholder:text-foreground/30 focus:border-flame focus:outline-none"
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-foreground px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
              >
                Invia richiesta →
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-6 px-6 py-12 md:flex-row md:items-end lg:px-12">
          <div>
            <span className="font-display text-3xl font-bold tracking-tight">
              MATRICE<span className="font-light italic text-foreground/60">GROUP</span>
            </span>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Agenti: Michele Pone e Valentina Infantozzi · Ingegnere: Giuseppe Di Giacomo ·
              Consulente aste: Matteo Leoncini · NPL: Corrado Predellini
            </p>
          </div>
          <div className="flex flex-col gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Via di Villanova 16, Napoli</span>
            <span className="normal-case tracking-normal">
              <a href="tel:+393457603610" className="transition-colors hover:text-flame">
                345 760 3610
              </a>{" "}
              ·{" "}
              <a
                href="https://wa.me/393457603610"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-flame"
              >
                WhatsApp
              </a>{" "}
              ·{" "}
              <a href="mailto:info@matricegroup.com" className="transition-colors hover:text-flame">
                info@matricegroup.com
              </a>
            </span>
            <span>C.C.I.A.A. Napoli · Ruolo Agenti di affari in mediazione n. 424903</span>
            <span className="flex gap-3">
              <Link to="/privacy-policy" className="transition-colors hover:text-flame">
                Privacy Policy
              </Link>
              <Link to="/cookie-policy" className="transition-colors hover:text-flame">
                Cookie Policy
              </Link>
            </span>
            <span>© 2026 Matrice Group. Tutti i diritti riservati.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
