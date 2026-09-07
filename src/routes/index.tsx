import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

import heroCity from "@/assets/hero-city.jpg";
import interior from "@/assets/interior.jpg";
import palazzo from "@/assets/palazzo.jpg";
import fiaip from "@/assets/fiaip.png.asset.json";
import teamMichele from "@/assets/michele-pone.png.asset.json";
import teamValentina from "@/assets/team-valentina.jpg";
import teamGiuseppe from "@/assets/team-giuseppe.jpg";
import teamMatteo from "@/assets/team-matteo.asset.json";
import teamCorrado from "@/assets/team-corrado.jpg";
import logo from "@/assets/logo-matrice.png";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ContactMenu } from "@/components/ContactMenu";


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
  { name: "Michele Pone", role: "Agente immobiliare · Titolare", img: teamMichele.url },
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

const navLinks = [
  { href: "#chi-siamo", label: "Chi siamo" },
  { href: "#servizi", label: "Servizi" },
  { href: "#immobili", label: "Immobili" },
  { href: "#team", label: "Team" },
  { href: "#contatti", label: "Contatti" },
];

function Index() {
  const { oggetto } = Route.useSearch();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="overflow-x-hidden bg-background text-foreground antialiased">
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-12 lg:py-5">
          <a href="#top" className="flex min-w-0 items-center gap-2.5 py-1">
            <img
              src={logo}
              alt="Logo Matrice Group"
              width={452}
              height={480}
              className="h-8 w-auto shrink-0 sm:h-10"
            />
            <span className="truncate font-display text-base font-bold tracking-tight sm:text-2xl">
              MATRICE<span className="font-light italic opacity-70">GROUP</span>
            </span>
          </a>
          <nav className="hidden items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/80 lg:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="px-3 py-2 transition-colors hover:text-flame">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <a
              href="https://wa.me/393457603610"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 shrink-0 items-center rounded-full bg-foreground px-3.5 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-background transition-colors hover:bg-flame hover:text-flame-foreground lg:px-8 lg:py-4 lg:text-[11px]"
            >
              Parla con noi
            </a>
            <button
              type="button"
              aria-label={menuOpen ? "Chiudi il menu" : "Apri il menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex size-11 items-center justify-center rounded-full border border-white/15 text-foreground transition-colors hover:text-flame lg:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="border-t border-white/10 bg-background/95 px-4 pb-4 backdrop-blur-xl sm:px-6 lg:hidden">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center border-b border-white/10 font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-foreground/85 transition-colors last:border-b-0 hover:text-flame"
              >
                {l.label}
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      {/* HERO — full-bleed cinematic */}
      <section id="top" className="relative flex min-h-svh flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroCity}
            alt="Facciata di un palazzo residenziale elegante illuminata all'ora blu"
            width={1920}
            height={1088}
            className="h-full w-full animate-hero-zoom object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/10 to-background" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/5 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 pt-32 pb-12 sm:px-6 lg:px-12 lg:pt-40 lg:pb-14">
          <p className="mb-6 flex items-start gap-3 font-mono text-[9px] font-bold uppercase leading-relaxed tracking-[0.28em] text-flame animate-reveal sm:items-center sm:gap-4 sm:text-[10px] sm:tracking-[0.4em] lg:mb-8">
            <span className="mt-2 h-px w-8 shrink-0 bg-flame sm:mt-0 sm:w-10" />
            Mediazione immobiliare · Consulenza · Investimenti — Dal 2011
          </p>

          <h1 className="font-display text-[2.6rem] leading-[1] tracking-tight sm:text-[7vw] sm:leading-[0.95] lg:text-[8.5rem] lg:leading-[0.92]">
            <span className="block animate-reveal">Il valore di un immobile.</span>
            <span className="block animate-reveal font-normal text-foreground/90 [animation-delay:150ms]">
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
                href="https://wa.me/393457603610"
                target="_blank"
                rel="noopener noreferrer"
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

          {/* Dati chiave */}
          <div className="mt-14 grid border-y border-white/15 md:grid-cols-3 animate-reveal [animation-delay:450ms]">
            {[
              { k: "13+", v: "Anni di attività" },
              { k: "05", v: "Professionisti in team" },
              { k: "09", v: "Partner in rete nazionale" },
            ].map((s) => (
              <div
                key={s.v}
                className="border-b border-white/15 py-6 last:border-b-0 md:border-r md:border-b-0 md:px-7 md:first:pl-0 md:last:border-r-0"
              >
                <p className="font-display text-4xl font-medium tabular-nums">{s.k}</p>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-foreground/55">
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANNUNCI AGGIORNATI */}
      <section id="immobili" className="border-b border-white/10 py-16 lg:py-20">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-6 lg:px-12">
          <ScrollReveal className="grid gap-8 border-y border-white/15 py-9 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-flame">
                / 01 · Annunci aggiornati
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight lg:text-5xl">
                Scopri le proprietà disponibili
              </h2>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <a
                href="https://www.immobiliare.it/pro/382689/pone/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
              >
                Guarda tutti gli immobili su Immobiliare.it <ArrowUpRight className="size-4" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SERVIZI — over palazzo backdrop */}
      <section id="servizi" className="relative overflow-hidden py-16 lg:py-32">
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
        <div className="relative mx-auto max-w-[1600px] px-5 sm:px-6 lg:px-12">
          <ScrollReveal className="mb-14 grid gap-6 border-t border-white/15 pt-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="mb-5 font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-flame">
                / 02 · Competenze
              </p>
              <h2 className="font-display text-[2.4rem] leading-[1.02] sm:text-[8vw] sm:leading-[0.95] tracking-tight lg:text-[5.5rem]">
                Cosa facciamo
              </h2>
              <p className="mt-4 max-w-lg text-lg font-light text-foreground/70">
                Servizi immobiliari costruiti intorno alle tue esigenze.
              </p>
            </div>
            <span className="hidden shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground md:block lg:col-span-4">
              ( 06 servizi )
            </span>
          </ScrollReveal>

          <div className="grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {servizi.map((s, index) => (
              <ScrollReveal key={s.n} delay={(index % 3) * 80} className="h-full bg-background/90">
                <article className="group flex h-full flex-col p-7 sm:min-h-72 sm:p-9 transition-colors duration-500 hover:bg-card/80 lg:p-10">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-flame">/ {s.n}</span>
                  <h3 className="mt-8 font-display text-3xl font-medium tracking-tight transition-colors group-hover:text-flame">
                    {s.title}
                  </h3>
                  <p className="mt-4 flex-1 leading-relaxed text-muted-foreground">{s.text}</p>
                  <ArrowRight className="mt-7 size-5 text-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-flame" />
                </article>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="https://www.immobiliare.it/pro/382689/pone/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
            >
              Guarda tutti gli immobili su Immobiliare.it <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </section>


      {/* CHI SIAMO */}
      <section id="chi-siamo" className="mx-auto max-w-[1600px] px-5 py-16 sm:px-6 lg:px-12 lg:py-32">
        <ScrollReveal className="mb-14 grid gap-6 border-t border-white/15 pt-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="mb-5 font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-flame">
              / 03 · Matrice Group
            </p>
            <h2 className="font-display text-[2.4rem] leading-[1.02] sm:text-[8vw] sm:leading-[0.95] tracking-tight lg:text-[5.5rem]">
            Un team, un metodo,
            <br />
              una visione globale.
            </h2>
          </div>
          <span className="hidden shrink-0 max-w-xs text-right font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground md:block lg:col-span-4">
            ( Chi siamo — Seguiamo il cliente dal primo incontro fino ai servizi post rogito o post contratto d'affitto )
          </span>
        </ScrollReveal>

        <ScrollReveal className="grid gap-px border border-white/10 bg-white/10 lg:grid-cols-12">
          <div className="flex flex-col justify-between bg-card p-6 sm:p-10 lg:col-span-5 lg:p-12">
           <div className="lg:col-span-8">
              <p className="text-xl font-light leading-relaxed text-foreground/85">
                Una struttura solida da cui nascono competenze diverse: mediazione immobiliare,
                consulenza tecnica e legale, aste giudiziarie e investimenti.
              </p>
              <p className="mt-6 leading-relaxed text-muted-foreground">
                Dal residenziale al commerciale, senza fermarci a una singola nicchia.
              </p>
              <p className="mt-6 leading-relaxed text-muted-foreground">
                Consulenza tecnica, fiscale, legale e commerciale: compri, vendi o affitti con le
                massime garanzie di sicurezza.
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

          <div className="group relative overflow-hidden lg:col-span-7">
            <img
              src={interior}
              alt="Interno di un capannone industriale moderno con struttura in acciaio"
              width={1600}
              height={1008}
              loading="lazy"
               className="h-full min-h-[360px] w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-8 pt-20">
              <p className="font-display text-2xl font-light">
                “Seguire il cliente in ogni passo, dal primo incontro al post rogito.”
              </p>
            </div>
          </div>

          <div className="bg-background p-6 sm:p-8 lg:col-span-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-flame">
              / Rete nazionale
            </span>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Con la nostra rete di agenzie copriamo tutto il territorio nazionale: valutazioni
              attendibili, basate su dati reali.
            </p>
          </div>
          <div className="bg-background p-6 sm:p-8 lg:col-span-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-flame">
              / Aste e stralci
            </span>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Assistenza completa su aste giudiziarie, fallimenti e saldo e stralcio. Per gli
              investimenti internazionali lavoriamo con partner selezionati.
            </p>

          </div>

          <div className="bg-flame p-6 text-flame-foreground sm:p-8 lg:col-span-12">
            <p className="font-display text-2xl font-light leading-snug lg:text-3xl">
              “La nostra priorità è seguire il cliente in ogni passo, garantendo sicurezza e
              tranquillità nella trattativa immobiliare.”
            </p>
          </div>
        </ScrollReveal>
      </section>




      {/* TEAM */}
      <section id="team" className="mx-auto max-w-[1600px] px-5 py-16 sm:px-6 lg:px-12 lg:py-32">
        <ScrollReveal className="mb-14 flex items-end justify-between gap-6 border-t border-white/15 pt-8">
          <div>
            <p className="mb-5 font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-flame">
              / 04 · Professionisti
            </p>
            <h2 className="font-display text-[2.4rem] leading-[1.02] sm:text-[8vw] sm:leading-[0.95] tracking-tight lg:text-[5.5rem]">
              Il team
            </h2>
          </div>
          <span className="hidden shrink-0 max-w-xs text-right font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:block">
            Competenze diverse, un unico obiettivo.
          </span>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
          {team.map((m, index) => (
            <ScrollReveal key={m.name} delay={(index % 5) * 65}>
            <figure className="group overflow-hidden border-t border-white/15 bg-card">
              <div className="overflow-hidden">
                <img
                  src={m.img}
                  alt={`Ritratto di ${m.name}`}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="aspect-4/5 w-full object-cover grayscale transition-all duration-1000 ease-out group-hover:scale-[1.025] group-hover:grayscale-0"
                />
              </div>
              <figcaption className="p-4 sm:p-6">
                <p className="font-display text-xl tracking-tight">{m.name}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {m.role}
                </p>
              </figcaption>
            </figure>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* PARTNER */}
      <section id="partner" className="mx-auto max-w-[1600px] px-5 pb-16 sm:px-6 lg:px-12 lg:pb-32">
        <ScrollReveal className="mb-10 border-t border-white/15 pt-8">
          <p className="mb-5 font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-flame">
            / 05 · Rete professionale
          </p>
          <h2 className="font-display text-[2rem] leading-[1.05] sm:text-[6vw] sm:leading-[0.95] tracking-tight lg:text-[4rem]">
            Una rete di collaborazioni specialistiche
          </h2>
          <p className="mt-4 max-w-lg text-lg font-light text-foreground/70">
            Collaboriamo con realtà e professionisti che ampliano le competenze disponibili per i
            nostri clienti.
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10 md:grid-cols-4">
          {partner.map((p, index) => (
            <ScrollReveal key={p} delay={(index % 4) * 55} className="h-full bg-background">
              <div className="flex min-h-28 h-full items-center justify-center px-6 py-8 text-center font-display text-lg font-light text-foreground/60 transition-colors duration-500 hover:bg-card hover:text-flame">
                {p}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CONTATTI */}
      <section id="contatti" className="border-t border-white/10 py-16 lg:py-32">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-5 sm:px-6 lg:grid-cols-12 lg:px-12">
          <ScrollReveal className="lg:col-span-6">
            <p className="mb-5 font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-flame">
              / 06 · Contatti
            </p>
            <h2 className="font-display text-[2.4rem] leading-[1.02] sm:text-[8vw] sm:leading-[0.95] tracking-tight lg:text-[5rem]">
              Parliamo del tuo prossimo progetto.
            </h2>
            <p className="mt-8 max-w-md text-lg font-light leading-relaxed text-muted-foreground">
              Raccontaci l'operazione: un referente del team ti ricontatta con una prima
              valutazione.
            </p>
            <dl className="mt-12 space-y-5 font-mono text-[11px] uppercase tracking-[0.2em]">
              <div className="flex gap-4 border-t border-white/10 pt-5">
                <dt className="w-24 shrink-0 pt-2 text-muted-foreground">Contatto</dt>
                <dd>
                  <ContactMenu />
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
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-6" delay={100}>
          <form
            className="border-t border-white/15 bg-card p-6 sm:p-10 lg:p-12"
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
                  className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-base text-foreground placeholder:text-foreground/30 focus:border-flame focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  placeholder="nome@dominio.it"
                  className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-base text-foreground placeholder:text-foreground/30 focus:border-flame focus:outline-none"
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
                  className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-base text-foreground placeholder:text-foreground/30 focus:border-flame focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  Messaggio
                </span>
                <textarea
                  rows={3}
                  placeholder="Come possiamo aiutarti?"
                  className="mt-2 w-full resize-none border-b border-white/15 bg-transparent py-3 text-base text-foreground placeholder:text-foreground/30 focus:border-flame focus:outline-none"
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
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-6 px-5 pt-12 pb-28 sm:px-6 sm:pb-12 md:flex-row md:items-end lg:px-12">
          <div>
            <span className="font-display text-3xl font-bold tracking-tight">
              MATRICE<span className="font-light italic text-foreground/60">GROUP</span>
            </span>
          </div>
          <div className="flex flex-col gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Via di Villanova 16, Napoli</span>
            <span className="normal-case tracking-normal">
              <a href="mailto:info@matricegroup.com" className="transition-colors hover:text-flame">
                info@matricegroup.com
              </a>
            </span>
            <span className="py-2">
              <ContactMenu className="px-5 py-2.5 text-[9px]" />
            </span>

            <span>C.C.I.A.A. Napoli · Ruolo Agenti di affari in mediazione n. 424903</span>
            <span className="flex gap-5 py-1">
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
