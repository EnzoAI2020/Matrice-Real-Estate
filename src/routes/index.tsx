import { createFileRoute } from "@tanstack/react-router";

import heroBuilding from "@/assets/hero-building.jpg";
import interior from "@/assets/interior.jpg";
import teamMichele from "@/assets/team-michele.jpg";
import teamValentina from "@/assets/team-valentina.jpg";
import teamGiuseppe from "@/assets/team-giuseppe.jpg";
import teamMatteo from "@/assets/team-matteo.jpg";
import teamCorrado from "@/assets/team-corrado.jpg";

export const Route = createFileRoute("/")({
  component: Index,
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
          address: { "@type": "PostalAddress", addressLocality: "Napoli", addressCountry: "IT" },
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
  "Studio 081 Architects & Partners",
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
  return (
    <div className="bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 lg:px-12">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid size-7 -skew-x-12 place-items-center bg-flame">
              <span className="size-2.5 rotate-12 bg-brand" />
            </span>
            <span className="font-display text-2xl leading-none tracking-tight text-brand">
              MATRICE
            </span>
            <span className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              GROUP
            </span>
          </a>
          <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:flex">
            <a href="#chi-siamo" className="transition-colors hover:text-flame">
              Chi siamo
            </a>
            <a href="#servizi" className="transition-colors hover:text-flame">
              Servizi
            </a>
            <a href="#team" className="transition-colors hover:text-flame">
              Team
            </a>
            <a href="#partner" className="transition-colors hover:text-flame">
              Partner
            </a>
          </nav>
          <a
            href="#contatti"
            className="-skew-x-12 bg-brand px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-foreground transition-colors hover:bg-flame hover:text-flame-foreground"
          >
            <span className="inline-block skew-x-12">Parla con noi →</span>
          </a>
        </div>
      </header>

      {/* HERO — BENTO */}
      <section id="top" className="mx-auto max-w-[1600px] px-6 pt-8 pb-6 lg:px-12">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-flame">
            // Mediazione immobiliare · Consulenza · Investimenti — Napoli
        </p>

        <div className="grid gap-3 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
          {/* Titolo */}
          <div className="border border-border bg-secondary p-8 lg:col-span-8 lg:p-10">
            <h1 className="font-display leading-[0.84] tracking-tight text-brand">
              <span className="block text-[14vw] lg:text-[7.5rem]">IL VALORE</span>
              <span className="block text-[14vw] lg:text-[7.5rem]">DI UN IMMOBILE.</span>
              <span className="-skew-x-6 block text-[14vw] text-flame lg:text-[7.5rem]">
                LA SICUREZZA
              </span>
              <span className="block text-[14vw] lg:text-[7.5rem]">DI UNA SCELTA.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg font-medium text-muted-foreground">
              Matrice Group accompagna privati e investitori in ogni fase della trattativa, con
              professionalità, riservatezza, competenza e una rete di professionisti qualificati.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contatti"
                className="-skew-x-12 bg-brand px-7 py-4 font-mono text-[12px] uppercase tracking-[0.18em] text-brand-foreground transition-colors hover:bg-flame hover:text-flame-foreground"
              >
                <span className="inline-block skew-x-12">Parla con noi →</span>
              </a>
              <a
                href="#servizi"
                className="-skew-x-12 border border-input px-7 py-4 font-mono text-[12px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-flame hover:text-flame"
              >
                <span className="inline-block skew-x-12">Scopri i servizi</span>
              </a>
            </div>
          </div>

          {/* Immagine + badge */}
          <div className="relative border border-border lg:col-span-4">
            <img
              src={heroBuilding}
              alt="Facciata di un edificio residenziale contemporaneo in Italia"
              width={1216}
              height={1536}
              className="h-full min-h-[380px] w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 -skew-x-12 bg-flame px-4 py-3">
              <span className="inline-block skew-x-12 font-display text-2xl text-flame-foreground">
                DAL 2011
              </span>
            </div>
          </div>

          {/* Credenziale */}
          <div className="border border-border bg-brand p-8 text-brand-foreground lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-flame">
              Iscrizione al ruolo
            </p>
            <p className="mt-4 text-base leading-relaxed text-brand-foreground/80">
              Matrice Group, nella persona del titolare Sig. Michele Pone, è iscritta al Ruolo degli
              Agenti di affari in mediazione presso la C.C.I.A.A. di Napoli al n.{" "}
              <span className="font-display text-2xl align-middle text-brand-foreground">424903</span>.
            </p>
          </div>

          {/* Numeri */}
          <div className="grid grid-cols-3 border border-border lg:col-span-7">
            {[
              { k: "13+", v: "Anni di attività" },
              { k: "05", v: "Professionisti" },
              { k: "08", v: "Partner in rete" },
            ].map((s) => (
              <div key={s.k} className="border-l border-border p-6 first:border-l-0 lg:p-8">
                <p className="font-display text-5xl text-brand lg:text-6xl">{s.k}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="-skew-y-1 overflow-hidden">
        <div className="overflow-hidden bg-brand py-3">
          <div className="flex w-max animate-marquee whitespace-nowrap font-display text-2xl tracking-tight text-brand-foreground/90">
            {[0, 1].map((rep) => (
              <div key={rep} className="flex">
                {marqueeWords.map((w) => (
                  <span key={w} className="flex items-center">
                    <span className="px-6">{w}</span>
                    <span className="text-flame">◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHI SIAMO — BENTO */}
      <section id="chi-siamo" className="mx-auto max-w-[1600px] px-6 py-20 lg:px-12">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 className="font-display text-[11vw] leading-[0.85] tracking-tight text-brand lg:text-[6rem]">
            UN TEAM,
            <br />
            UN METODO,
            <span className="text-flame"> UNA VISIONE.</span>
          </h2>
          <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground md:block">
            ( Chi siamo )
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-12">
          <div className="border border-border bg-secondary p-8 lg:col-span-5 lg:p-10">
            <p className="text-lg leading-relaxed text-foreground/80">
              Matrice Group nasce come punto di origine solido e strutturato da cui si sviluppano
              competenze diverse: mediazione immobiliare, consulenza tecnica e legale, aste
              giudiziarie e investimenti.
            </p>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Il nome richiama precisione e affidabilità, il termine “Group” ne rappresenta il
              respiro ampio: una struttura professionale capace di muoversi su ambiti complessi, dal
              residenziale al business, senza fermarsi a una singola nicchia.
            </p>
          </div>

          <div className="border border-border lg:col-span-7">
            <img
              src={interior}
              alt="Interno di un attico con vista sul golfo al tramonto"
              width={1600}
              height={1000}
              loading="lazy"
              className="h-full min-h-[280px] w-full object-cover"
            />
          </div>

          <div className="border border-border p-8 lg:col-span-4">
            <span className="font-mono text-[11px] text-flame">/ Rete nazionale</span>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Grazie alla collaborazione con altre agenzie operiamo su tutto il territorio
              nazionale, conoscendo i valori degli immobili e garantendo valutazioni il più possibile
              attendibili.
            </p>
          </div>
          <div className="border border-border p-8 lg:col-span-4">
            <span className="font-mono text-[11px] text-flame">/ Aste e stralci</span>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Offriamo assistenza e consulenza globale a chi desidera acquistare un immobile tramite
              asta giudiziale, da un fallimento o attraverso operazioni di saldo e stralcio.
            </p>
          </div>
          <div className="border border-border bg-flame p-8 text-flame-foreground lg:col-span-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]">/ La priorità</span>
            <p className="mt-4 font-display text-3xl leading-[1.05] tracking-tight">
              SEGUIRE IL CLIENTE IN OGNI PASSO, DAL PRIMO INCONTRO AL POST ROGITO.
            </p>
          </div>
        </div>
      </section>

      {/* SERVIZI — BENTO */}
      <section id="servizi" className="bg-brand py-20 text-brand-foreground">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="font-display text-[12vw] leading-[0.85] tracking-tight lg:text-[6.5rem]">
              COSA
              <span className="text-flame"> FACCIAMO</span>
            </h2>
            <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.25em] text-brand-foreground/50 md:block">
              ( 06 servizi )
            </span>
          </div>

          <div className="grid gap-px border border-brand-foreground/15 bg-brand-foreground/15 md:grid-cols-2 lg:grid-cols-3">
            {servizi.map((s) => (
              <article
                key={s.n}
                className="group bg-brand p-8 transition-colors hover:bg-flame lg:p-10"
              >
                <span className="font-mono text-[11px] text-flame transition-colors group-hover:text-flame-foreground">
                  / {s.n}
                </span>
                <h3 className="mt-4 font-display text-3xl tracking-tight transition-colors group-hover:text-flame-foreground">
                  {s.title}
                </h3>
                <p className="mt-4 leading-relaxed text-brand-foreground/60 transition-colors group-hover:text-flame-foreground/80">
                  {s.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM — BENTO */}
      <section id="team" className="mx-auto max-w-[1600px] px-6 py-20 lg:px-12">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 className="font-display text-[12vw] leading-[0.85] tracking-tight text-brand lg:text-[6.5rem]">
            IL <span className="text-flame">TEAM</span>
          </h2>
          <span className="hidden shrink-0 max-w-xs font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:block">
            Competenze diverse, un unico obiettivo.
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {team.map((m) => (
            <figure key={m.name} className="group border border-border">
              <div className="overflow-hidden">
                <img
                  src={m.img}
                  alt={`Ritratto di ${m.name}`}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="aspect-4/5 w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                />
              </div>
              <figcaption className="border-t border-border p-5">
                <p className="font-display text-xl tracking-tight text-brand">{m.name}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {m.role}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* PARTNER */}
      <section id="partner" className="mx-auto max-w-[1600px] px-6 pb-20 lg:px-12">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 className="font-display text-[10vw] leading-[0.85] tracking-tight text-brand lg:text-[4.5rem]">
            UNA RETE DI COLLABORAZIONI<span className="text-flame"> SPECIALISTICHE</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          {partner.map((p) => (
            <div
              key={p}
              className="flex min-h-28 items-center justify-center bg-background px-6 py-8 text-center font-display text-lg tracking-tight text-brand/70 transition-colors hover:bg-brand hover:text-brand-foreground"
            >
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* CONTATTI */}
      <section id="contatti" className="bg-flame py-20 text-flame-foreground">
        <div className="mx-auto grid max-w-[1600px] gap-3 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-6">
            <h2 className="font-display text-[12vw] leading-[0.85] tracking-tight lg:text-[6rem]">
              PARLIAMO DEL TUO PROSSIMO PROGETTO.
            </h2>
            <p className="mt-6 max-w-md text-lg font-medium text-flame-foreground/80">
              Raccontaci l'operazione: un referente del team ti ricontatta con una prima valutazione.
            </p>
            <dl className="mt-10 space-y-4 font-mono text-[12px] uppercase tracking-[0.15em]">
              <div className="flex gap-4 border-t border-flame-foreground/25 pt-4">
                <dt className="w-24 shrink-0 text-flame-foreground/60">Telefono</dt>
                <dd>Da inserire</dd>
              </div>
              <div className="flex gap-4 border-t border-flame-foreground/25 pt-4">
                <dt className="w-24 shrink-0 text-flame-foreground/60">Email</dt>
                <dd>Da inserire</dd>
              </div>
              <div className="flex gap-4 border-t border-flame-foreground/25 pt-4">
                <dt className="w-24 shrink-0 text-flame-foreground/60">Indirizzo</dt>
                <dd>Da inserire</dd>
              </div>
            </dl>
          </div>

          <form
            className="bg-brand p-8 text-brand-foreground lg:col-span-6 lg:p-10"
            onSubmit={(e) => e.preventDefault()}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-flame">
              Richiedi informazioni
            </p>
            <div className="mt-8 space-y-6">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-foreground/60">
                  Nome e cognome
                </span>
                <input
                  type="text"
                  placeholder="Il tuo nome"
                  className="mt-2 w-full border-b border-brand-foreground/25 bg-transparent py-3 text-brand-foreground placeholder:text-brand-foreground/35 focus:border-flame focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-foreground/60">
                  Email
                </span>
                <input
                  type="email"
                  placeholder="nome@dominio.it"
                  className="mt-2 w-full border-b border-brand-foreground/25 bg-transparent py-3 text-brand-foreground placeholder:text-brand-foreground/35 focus:border-flame focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-foreground/60">
                  Oggetto
                </span>
                <input
                  type="text"
                  placeholder="Compravendita, valutazione, aste…"
                  className="mt-2 w-full border-b border-brand-foreground/25 bg-transparent py-3 text-brand-foreground placeholder:text-brand-foreground/35 focus:border-flame focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-foreground/60">
                  Messaggio
                </span>
                <textarea
                  rows={3}
                  placeholder="Come possiamo aiutarti?"
                  className="mt-2 w-full resize-none border-b border-brand-foreground/25 bg-transparent py-3 text-brand-foreground placeholder:text-brand-foreground/35 focus:border-flame focus:outline-none"
                />
              </label>
              <button
                type="submit"
                className="-skew-x-12 bg-flame px-8 py-4 font-mono text-[12px] uppercase tracking-[0.18em] text-flame-foreground transition-colors hover:bg-brand-foreground hover:text-brand"
              >
                <span className="inline-block skew-x-12">Invia richiesta →</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-background">
        <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-6 px-6 py-12 md:flex-row md:items-end lg:px-12">
          <div>
            <span className="font-display text-3xl tracking-tight">
              MATRICE<span className="text-flame">GROUP</span>
            </span>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
              Agenti: Michele Pone e Valentina Infantozzi · Ingegnere: Giuseppe Di Giacomo ·
              Consulente aste: Matteo Leoncini · NPL: Corrado Predellini
            </p>
          </div>
          <div className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
            <span>C.C.I.A.A. Napoli · Ruolo Agenti di affari in mediazione n. 424903</span>
            <span>© 2026 Matrice Group. Tutti i diritti riservati.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
