import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import heroResidenza from "@/assets/hero-immobile-commerciale-tramonto.webp";
import contattiFacciata from "@/assets/contatti-facciata-uffici.webp";
import chiSiamoInterno from "@/assets/chi-siamo-interno-panoramico.webp";
import cosaFacciamo from "@/assets/cosa-facciamo.webp";
import reteCollaborazioni from "@/assets/rete-collaborazioni-professionali.webp";
import fotoMichele from "@/assets/michele-pone-agente-immobiliare-napoli.webp";
import fotoValentina from "@/assets/valentina-infantozzi-agente-immobiliare-napoli.webp";
import fotoGiuseppe from "@/assets/giuseppe-di-giacomo-ingegnere-napoli.webp";
import fotoMatteo from "@/assets/matteo-leoncini-consulente-aste-immobiliari-napoli.webp";
import fotoCorrado from "@/assets/corrado-predellini-npl-specialist-napoli.webp";
import fotoUgo from "@/assets/ugo-delfino-responsabile-locali-commerciali-napoli.webp";
import fotoArciuolo from "@/assets/salvatore-arciuolo-avvocato-napoli.webp";
import logo from "@/assets/logo-matrice-monogram.webp";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ContactMenu } from "@/components/ContactMenu";
import { BuildingSketch } from "@/components/BuildingSketch";


export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: Record<string, unknown>): { oggetto?: string } => {
    const oggetto = search["oggetto"];
    return typeof oggetto === "string" ? { oggetto } : {};
  },
  head: () => ({
    meta: [
      { title: "Matrice Real Estate — Agenzia Immobiliare e Consulenza a Napoli | Dal 2011" },
      {
        name: "description",
        content:
          "Matrice Real Estate: mediazione immobiliare, consulenza tecnica e legale, aste giudiziarie, NPL e investimenti internazionali. Dal 2011, C.C.I.A.A. Napoli n. 424903.",
      },
      { property: "og:title", content: "Matrice Real Estate — Agenzia Immobiliare a Napoli" },
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
          name: "Matrice Real Estate",
          description:
            "Mediazione immobiliare, consulenza tecnica, fiscale e legale, aste giudiziarie, NPL e investimenti internazionali.",
          areaServed: "IT",
          foundingDate: "2011",
          telephone: "+39 345 760 3610",
          email: "info@matricerealestate.it",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Via Toledo 265",
            postalCode: "80134",
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
    title: "Consulenza globale",
    text: "Consulenza tecnica, fiscale, legale e commerciale per affrontare ogni passaggio con maggiore consapevolezza.",
  },
];

const team: { name: string; role: string; img: string; email?: string }[] = [
  {
    name: "Michele Pone",
    role: "Agente immobiliare · Titolare",
    email: "michele.pone@matricerealestate.it",
    img: fotoMichele,
  },
  {
    name: "Valentina Infantozzi",
    role: "Agente immobiliare · Architetto",
    email: "valentina.infantozzi@matricerealestate.it",
    img: fotoValentina,
  },
  {
    name: "Giuseppe Di Giacomo",
    role: "Ingegnere",
    email: "giuseppedigiacomo@libero.it",
    img: fotoGiuseppe,
  },
  {
    name: "Matteo Leoncini",
    role: "Consulente aste immobiliari",
    email: "matteo.leoncini@reattivonpl.com",
    img: fotoMatteo,
  },
  {
    name: "Corrado Predellini",
    role: "NPL Specialist",
    email: "corrado.predellini@reattivonpl.com",
    img: fotoCorrado,
  },
  {
    name: "Ugo Delfino",
    role: "Responsabile locali commerciali",
    img: fotoUgo,
  },
  {
    name: "Avv. Salvatore Arciuolo",
    role: "Avvocato",
    img: fotoArciuolo,
  },
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

// URL della distribuzione Apps Script (Distribuisci > App web > /exec).
// Si puo sovrascrivere con VITE_CONTACT_ENDPOINT senza toccare il codice.
const CONTACT_ENDPOINT =
  import.meta.env["VITE_CONTACT_ENDPOINT"] ?? "INCOLLA_QUI_URL_APPS_SCRIPT";

type StatoInvio = "idle" | "invio" | "ok" | "errore" | "non-configurato";

/**
 * L'endpoint e' utilizzabile solo se e' un URL assoluto. Finche' resta il
 * segnaposto, fetch() lo tratterebbe come percorso relativo del sito e
 * fallirebbe con un 404: un errore fuorviante, che sembra un guasto
 * dell'invio invece di una configurazione mancante.
 */
const ENDPOINT_CONFIGURATO = /^https?:\/\//i.test(CONTACT_ENDPOINT);

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
  // Header trasparente sull hero, solido appena si scorre.
  const [scrolled, setScrolled] = useState(false);
  const [stato, setStato] = useState<StatoInvio>("idle");
  // Serve a personalizzare la conferma dopo l'invio.
  const [inviato, setInviato] = useState<{ nome: string; oggetto: string } | null>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="overflow-x-hidden bg-background text-foreground antialiased">
      {/* NAV */}
      <header
        className={
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 " +
          (scrolled
            ? "border-white/10 bg-background/80 backdrop-blur-xl"
            : "border-transparent bg-transparent")
        }
      >
        <div className="relative mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-12 lg:py-5">
          <a href="#top" className="flex shrink-0 items-center gap-2.5 py-1">
            <img
              src={logo}
              alt="Logo Matrice Real Estate"
              width={2522}
              height={2278}
              className="h-8 w-auto shrink-0 sm:h-10"
            />
            <span className="whitespace-nowrap font-display text-sm font-bold tracking-tight sm:text-2xl">
              MATRICE <span className="font-light italic opacity-70">GROUP</span>
            </span>
          </a>
          <nav className="hidden items-center gap-1 text-base text-foreground/75 lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="px-4 py-2.5 transition-colors hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <a
              href="https://wa.me/393457603610"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-3 py-3 text-xs sm:px-4 font-medium text-foreground backdrop-blur-sm transition-colors hover:border-flame hover:text-flame lg:px-7 lg:py-4 lg:text-base"
            >
              Parla con noi
              <ArrowUpRight className="size-3.5 lg:size-4" />
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
                className="flex min-h-12 items-center border-b border-white/10 text-base text-foreground/85 transition-colors last:border-b-0 hover:text-flame"
              >
                {l.label}
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      {/* HERO — full-bleed cinematic */}
      <section
        id="top"
        className="relative flex min-h-svh flex-col overflow-hidden pt-28 pb-10 sm:pt-32 lg:pb-14"
      >
        <div className="absolute inset-0">
          <img
            src={heroResidenza}
            alt="Immobile commerciale contemporaneo illuminato al tramonto"
            width={1672}
            height={941}
            className="h-full w-full animate-hero-zoom object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/25 to-background" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/5 to-transparent" />
          {/* Velo scuro dietro al testo: l immagine e chiara proprio li */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        {/* Wordmark decorativo */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-10 mx-auto w-full max-w-[1600px] px-5 sm:px-6 lg:px-12"
        >
          <span
            className="block animate-reveal font-sans font-medium leading-[0.85] tracking-[-0.025em] text-white/25 text-[19vw] -mt-[16px] drop-shadow-[0_2px_40px_rgba(255,255,255,0.18)] lg:mt-[4px] lg:text-right lg:text-[13vw]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, #000 0%, #000 56%, rgba(0,0,0,0.4) 80%, transparent 97%)",
              maskImage:
                "linear-gradient(to bottom, #000 0%, #000 56%, rgba(0,0,0,0.4) 80%, transparent 97%)",
            }}
          >
            Matrice
          </span>
        </div>

        {/* Blocco inferiore */}
        <div className="relative z-20 mx-auto mt-auto w-full max-w-[1600px] px-5 pt-14 sm:px-6 lg:px-12">
          <div className="max-w-3xl animate-reveal [animation-delay:150ms]">
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.9rem]">
              Il valore di un immobile.
              <span className="block font-normal text-foreground/85">
                La sicurezza di una scelta.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-foreground/75">
              Matrice Real Estate accompagna privati e investitori a Napoli e in tutta Italia, in ogni
              fase della trattativa, con professionalità, riservatezza e una rete di professionisti
              qualificati.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="https://wa.me/393457603610"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-foreground px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
              >
                Parla con noi
              </a>
              <Link
                to="/immobili"
                className="rounded-full border border-white/25 px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground backdrop-blur-sm transition-colors hover:border-flame hover:text-flame"
              >
                Scopri gli immobili
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ANNUNCI AGGIORNATI */}
      <section id="immobili" className="border-b border-white/10 py-16 lg:py-24">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-6 lg:px-12">
          <ScrollReveal className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-flame/10 blur-3xl"
            />
            <div className="relative grid gap-9 lg:grid-cols-12 lg:items-end lg:gap-12">
              <div className="lg:col-span-7">
                <h2 className="font-display text-4xl leading-[1.05] tracking-tight lg:text-[3.4rem]">
                  Scopri le proprietà disponibili
                </h2>
                <p className="mt-5 max-w-lg text-base font-light leading-relaxed text-foreground/70">
                  Gli immobili che seguiamo sono consultabili qui sul sito, con schede
                  aggiornate ogni giorno. Il portafoglio e pubblicato anche sulla vetrina
                  Immobiliare.it di Matrice Real Estate.
                </p>
              </div>
              {/* Due destinazioni diverse: la prima resta sul sito, la seconda
                  porta sul portale esterno. I nomi lo devono dire. */}
              <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end lg:justify-end">
                <Link
                  to="/immobili"
                  className="group inline-flex items-center gap-4 rounded-full bg-foreground py-2.5 pl-7 pr-2.5 text-background transition-colors hover:bg-flame hover:text-flame-foreground"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
                    Scopri gli immobili
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground">
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                </Link>
                <a
                  href="https://www.immobiliare.it/pro/382689/pone/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-4 rounded-full border border-white/25 py-2.5 pl-7 pr-2.5 text-foreground transition-colors hover:border-flame hover:text-flame"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
                    Vetrina su Immobiliare.it
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/25 text-foreground transition-colors group-hover:border-flame">
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SERVIZI — over grattacieli backdrop */}
      <section id="servizi" className="relative overflow-hidden py-16 lg:py-32">
        <div className="absolute inset-0">
          <img
            src={cosaFacciamo}
            alt=""
            width={1672}
            height={941}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/92 via-background/82 to-background/88" />
        </div>
        <div className="relative mx-auto max-w-[1600px] px-5 sm:px-6 lg:px-12">
          <ScrollReveal className="mb-14 grid gap-6 pt-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h2 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.9rem]">
                Cosa facciamo
              </h2>
              <p className="mt-4 max-w-lg text-lg font-light text-foreground/70">
                Servizi immobiliari costruiti intorno alle tue esigenze.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {servizi.map((s, index) => (
              <ScrollReveal key={s.n} delay={(index % 3) * 80} className="h-full">
                <article className="group flex h-full flex-col rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.12] to-white/[0.04] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:from-white/[0.18] hover:to-white/[0.07] sm:min-h-72 sm:p-9 lg:p-10">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-flame">/ {s.n}</span>
                  <h3 className="mt-8 font-display text-3xl font-medium tracking-tight transition-colors group-hover:text-flame">
                    {s.title}
                  </h3>
                  <p className="mt-5 flex-1 border-t border-white/10 pt-5 leading-relaxed text-foreground/70">{s.text}</p>
                </article>
              </ScrollReveal>
            ))}

            {/* Sesta cella: le due destinazioni, centrate nello spazio vuoto.
                La prima resta sul sito, la seconda porta al portale esterno. */}
            <ScrollReveal delay={160} className="h-full">
              <div className="flex h-full flex-col items-center justify-center gap-3 py-4">
                <Link
                  to="/immobili"
                  className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
                >
                  Scopri gli immobili <ArrowUpRight className="size-4 shrink-0" />
                </Link>
                <a
                  href="https://www.immobiliare.it/pro/382689/pone/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-full border border-white/25 px-8 py-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-flame hover:text-flame"
                >
                  Guarda su Immobiliare.it <ArrowUpRight className="size-4 shrink-0" />
                </a>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>


      {/* CHI SIAMO */}
      <section id="chi-siamo" className="mx-auto max-w-[1600px] px-5 py-16 sm:px-6 lg:px-12 lg:py-32">
        {/* Blocco immagine: l'immagine fa da sfondo all'intero blocco e il
            testo ci sta sopra, sfumando nel fondo. La sfumatura vale a ogni
            larghezza: prima era solo da lg in su, e sotto quella soglia il
            pannello ripiegava su un fondo pieno, creando uno stacco netto. */}
        <ScrollReveal className="relative isolate overflow-hidden rounded-3xl border border-white/12">
          <img
            src={chiSiamoInterno}
            alt="Interno panoramico di un ufficio contemporaneo affacciato sullo skyline al tramonto"
            width={1672}
            height={941}
            loading="lazy"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />

          {/* Velatura alta: stacca il titolo dall'immagine */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-background/85 via-background/35 to-transparent"
          />
          {/* Velatura bassa: sfuma l'immagine nel fondo, senza bordo netto */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-gradient-to-t from-background via-background/92 to-transparent"
          />

          <div className="flex min-h-[540px] flex-col justify-between gap-14 p-6 sm:min-h-[640px] sm:p-10 lg:min-h-[780px] lg:gap-20 lg:p-14">
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.9rem]">
              Un team, un metodo,
              <br />
              una visione globale.
            </h2>

            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <p className="text-lg font-light leading-relaxed text-foreground sm:text-xl">
                  Una struttura solida da cui nascono competenze diverse: mediazione immobiliare,
                  consulenza tecnica e legale, aste giudiziarie e investimenti.
                </p>
                <p className="mt-5 leading-relaxed text-foreground/75">
                  Dal residenziale al commerciale, senza fermarci a una singola nicchia.
                </p>
                <p className="mt-5 leading-relaxed text-foreground/75">
                  Consulenza tecnica, fiscale, legale e commerciale: compri, vendi o affitti con le
                  massime garanzie di sicurezza.
                </p>
              </div>
              <div className="lg:col-span-5 lg:border-l lg:border-white/15 lg:pl-10">
                <span className="block h-px w-12 bg-flame" />
                <p className="mt-6 font-display text-xl font-light leading-snug lg:text-2xl">
                  “Seguire il cliente in ogni passo, dal primo incontro al post rogito.”
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Altre informazioni — citazione centrata, competenze e schizzo */}
        <ScrollReveal className="mt-16 border-t border-white/12 pt-14 lg:mt-24 lg:pt-20">
          <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.42em] text-foreground/55">
            Matrice <span className="text-flame">Real Estate</span>
          </p>

          <div className="mx-auto mt-12 max-w-4xl text-center lg:mt-16">
            <p className="font-display text-2xl font-light leading-snug lg:text-[2rem]">
              “La nostra priorità è seguire il cliente in ogni passo, garantendo sicurezza e
              tranquillità nella trattativa immobiliare.”
            </p>
          </div>

          <div className="mt-16 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-12">
            {/* Specializzazioni + iscrizione */}
            <div className="lg:col-span-4">
              <p className="font-display text-2xl font-light leading-snug lg:text-[1.75rem]">
                Le nostre
                <br />
                specializzazioni:
              </p>
              <ul className="mt-8">
                <li className="border-t border-white/12 py-6">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-foreground">
                    Rete nazionale
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Con la nostra rete di agenzie copriamo tutto il territorio nazionale:
                    valutazioni attendibili, basate su dati reali.
                  </p>
                </li>
                <li className="border-y border-white/12 py-6">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-foreground">
                    Aste e stralci
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Assistenza completa su aste giudiziarie, fallimenti e saldo e stralcio. Per gli
                    investimenti internazionali lavoriamo con partner selezionati.
                  </p>
                </li>
              </ul>

              <div className="mt-10 flex flex-col items-center rounded-2xl border border-white/12 bg-white/[0.04] p-8 text-center">
                {/* Il monogramma non e' una foto: va contenuto e non ritagliato,
                    quindi object-contain. Nessun cerchio dietro: il marchio
                    sta direttamente sul fondo della scheda. */}
                <img
                  src={logo}
                  alt="Logo Matrice Real Estate"
                  width={2522}
                  height={2278}
                  loading="lazy"
                  className="size-28 shrink-0 object-contain"
                />
                <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-flame">
                  Iscrizione al ruolo
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Matrice Real Estate, nella persona del titolare Sig. Michele Pone, è iscritta al
                  Ruolo degli Agenti di affari in mediazione presso la C.C.I.A.A. di Napoli al n.{" "}
                  <span className="text-foreground">424903</span> e aderisce alla FIAIP.
                </p>
              </div>
            </div>

            {/* Schizzo del palazzo */}
            <div className="lg:col-span-8">
              <BuildingSketch />
            </div>
          </div>

        </ScrollReveal>
      </section>

      {/* TEAM */}
      <section id="team" className="mx-auto max-w-[1600px] px-5 py-16 sm:px-6 lg:px-12 lg:py-32">
        <ScrollReveal className="mb-14 flex items-end justify-between gap-6 border-t border-white/15 pt-8">
          <div>
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
            <figure className="group relative overflow-hidden border-t border-white/15 bg-card transition-all duration-500 ease-out hover:z-10 hover:-translate-y-2 hover:border-white/30 hover:shadow-2xl hover:shadow-black/60">
              <div className="overflow-hidden">
                <img
                  src={m.img}
                  alt={`${m.name}, ${m.role} — Matrice Real Estate Napoli`}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="aspect-4/5 w-full object-cover object-[center_20%] brightness-[0.5] transition-all duration-700 ease-out group-hover:scale-[1.025] group-hover:brightness-100"
                />
              </div>
              <figcaption className="p-4 sm:p-6">
                <p className="font-display text-xl tracking-tight">{m.name}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {m.role}
                </p>
                {m.email ? (
                  <a
                    href={`mailto:${m.email}`}
                    className="mt-3 block break-all text-[10px] leading-snug text-foreground/70 transition-colors hover:text-flame sm:break-words sm:text-[11px]"
                  >
                    {m.email}
                  </a>
                ) : null}
              </figcaption>
            </figure>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* PARTNER — su sfondo notturno, elenco numerato */}
      <section id="partner" className="relative overflow-hidden py-28 lg:py-56">
        <div className="absolute inset-0">
          <img
            src={reteCollaborazioni}
            alt=""
            width={1672}
            height={941}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/88 via-background/82 to-background/92" />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-5 sm:px-6 lg:px-12">
          <ScrollReveal>
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.9rem]">
              Una rete di collaborazioni specialistiche
            </h2>
            <p className="mt-8 text-base font-light leading-relaxed text-foreground/70">
              Collaboriamo con realtà e professionisti che ampliano le competenze disponibili per i nostri clienti.
            </p>
          </ScrollReveal>

          <ScrollReveal className="mt-20 grid gap-x-12 sm:grid-cols-2 lg:mt-32 lg:grid-cols-3 lg:gap-x-16">
            {partner.map((p, index) => (
              <div
                key={p}
                className="group flex items-baseline gap-5 border-t border-white/12 py-10 transition-colors duration-300 hover:border-flame/60"
              >
                <span className="shrink-0 font-mono text-[10px] font-bold tracking-[0.2em] text-flame">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-lg font-light leading-snug text-foreground/85 transition-colors duration-300 group-hover:text-flame">
                  {p}
                </span>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* CONTATTI */}
      <section id="contatti" className="relative overflow-hidden border-t border-white/10 py-16 lg:py-32">
        <div className="absolute inset-0">
          <img
            src={contattiFacciata}
            alt=""
            width={1672}
            height={941}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/86 to-background/93" />
        </div>

        <div className="relative mx-auto grid max-w-[1600px] gap-12 px-5 sm:px-6 lg:grid-cols-12 lg:px-12">
          <ScrollReveal className="lg:col-span-6">
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
                <dt className="w-24 shrink-0 text-muted-foreground">Telefono</dt>
                <dd>
                  <a href="tel:+393457603610" className="transition-colors hover:text-flame">
                    +39 345 760 3610
                  </a>
                </dd>
              </div>
              <div className="flex gap-4 border-t border-white/10 pt-5">
                <dt className="w-24 shrink-0 text-muted-foreground">Email</dt>
                <dd>
                  <a
                    href="mailto:info@matricerealestate.it"
                    className="lowercase transition-colors hover:text-flame"
                  >
                    info@matricerealestate.it
                  </a>
                </dd>
              </div>
              <div className="flex gap-4 border-t border-white/10 pt-5">
                <dt className="w-24 shrink-0 text-muted-foreground">Indirizzo</dt>
                <dd>Via Toledo 265, Napoli 80134</dd>
              </div>
            </dl>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-6" delay={100}>
          {/* A invio riuscito il modulo lascia il posto alla conferma: i campi
              vuoti non servono piu' e lasciarli fa dubitare che sia partito. */}
          {stato === "ok" ? (
            <div
              role="status"
              className="border-t border-white/15 bg-card p-6 sm:p-10 lg:p-12"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-flame text-flame-foreground">
                <Check className="size-7" aria-hidden="true" />
              </span>

              <h3 className="mt-7 font-display text-3xl leading-tight tracking-tight lg:text-4xl">
                Grazie{inviato?.nome ? `, ${inviato.nome.split(" ")[0]}` : ""}.
              </h3>

              <p className="mt-5 text-base font-light leading-relaxed text-foreground/75">
                Abbiamo ricevuto la tua richiesta
                {inviato?.oggetto ? (
                  <>
                    {" "}
                    su <span className="text-foreground">{inviato.oggetto}</span>
                  </>
                ) : null}
                . Ti abbiamo mandato una conferma via email: se non la trovi,
                controlla anche la posta indesiderata.
              </p>

              <p className="mt-4 text-base font-light leading-relaxed text-foreground/75">
                Un referente del team ti ricontatta al piu' presto, di norma
                entro un giorno lavorativo.
              </p>

              <div className="mt-9 flex flex-wrap gap-4 border-t border-white/10 pt-7">
                <a
                  href="https://wa.me/393457603610"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
                >
                  Scrivici su WhatsApp <ArrowUpRight className="size-4" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setInviato(null);
                    setStato("idle");
                  }}
                  className="rounded-full border border-white/25 px-8 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-flame hover:text-flame"
                >
                  Invia un'altra richiesta
                </button>
              </div>
            </div>
          ) : (
          <form
            className="border-t border-white/15 bg-card p-6 sm:p-10 lg:p-12"
            onSubmit={async (e) => {
              e.preventDefault();
              if (stato === "invio") return;
              const modulo = e.currentTarget;
              const dati = Object.fromEntries(new FormData(modulo).entries());

              // Senza endpoint valido non si tenta nemmeno: meglio dirlo
              // che mostrare un errore di invio che non e' un errore di invio.
              if (!ENDPOINT_CONFIGURATO) {
                setStato("non-configurato");
                return;
              }

              setStato("invio");
              try {
                // text/plain evita il preflight CORS verso Apps Script.
                const risposta = await fetch(CONTACT_ENDPOINT, {
                  method: "POST",
                  headers: { "Content-Type": "text/plain;charset=utf-8" },
                  body: JSON.stringify(dati),
                });
                const esito = await risposta.json();
                if (!esito?.ok) throw new Error(esito?.errore ?? "invio_fallito");
                setInviato({
                  nome: String(dati["nome"] ?? "").trim(),
                  oggetto: String(dati["oggetto"] ?? "").trim(),
                });
                setStato("ok");
                modulo.reset();
              } catch {
                setStato("errore");
              }
            }}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-flame">
              Richiedi informazioni
            </p>
            <div className="mt-10 space-y-7">
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  Nome e cognome <span className="text-flame">*</span>
                </span>
                <input
                  type="text"
                  name="nome"
                  required
                  placeholder="Il tuo nome"
                  className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-base text-foreground placeholder:text-foreground/30 focus:border-flame focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  Email <span className="text-flame">*</span>
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="nome@dominio.it"
                  className="mt-2 w-full border-b border-white/15 bg-transparent py-3 text-base text-foreground placeholder:text-foreground/30 focus:border-flame focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  Oggetto <span className="text-flame">*</span>
                </span>
                <input
                  type="text"
                  name="oggetto"
                  required
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
                  name="messaggio"
                  placeholder="Come possiamo aiutarti?"
                  className="mt-2 w-full resize-none border-b border-white/15 bg-transparent py-3 text-base text-foreground placeholder:text-foreground/30 focus:border-flame focus:outline-none"
                />
              </label>
              {/* Honeypot: invisibile agli utenti, i bot lo compilano. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <button
                type="submit"
                disabled={stato === "invio"}
                className="rounded-full bg-foreground px-9 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-flame hover:text-flame-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {stato === "invio" ? "Invio in corso…" : "Invia richiesta →"}
              </button>

              {stato === "errore" ? (
                <p role="alert" className="text-sm leading-relaxed text-muted-foreground">
                  Invio non riuscito. Riprova, oppure scrivici a{" "}
                  <a
                    href="mailto:info@matricerealestate.it"
                    className="text-foreground underline transition-colors hover:text-flame"
                  >
                    info@matricerealestate.it
                  </a>
                  .
                </p>
              ) : null}
              {stato === "non-configurato" ? (
                <p role="alert" className="text-sm leading-relaxed text-muted-foreground">
                  Il modulo non è ancora collegato. Nel frattempo scrivici a{" "}
                  <a
                    href="mailto:info@matricerealestate.it"
                    className="text-foreground underline transition-colors hover:text-flame"
                  >
                    info@matricerealestate.it
                  </a>{" "}
                  oppure su WhatsApp al{" "}
                  <a
                    href="https://wa.me/393457603610"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline transition-colors hover:text-flame"
                  >
                    345 760 3610
                  </a>
                  .
                </p>
              ) : null}
            </div>
          </form>
          )}
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="overflow-hidden border-t border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-6 lg:px-12 lg:py-24">
          {/* marchio, invito e navigazione */}
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <span
                aria-hidden="true"
                className="block select-none font-sans text-[3rem] font-bold leading-none tracking-tight sm:text-7xl lg:text-[6.5rem]"
              >
                MATRICE
              </span>
              <p className="mt-9 font-display text-xl leading-snug text-foreground/85 lg:text-2xl">
                Parliamo del tuo immobile.
              </p>
              {/* Due azioni distinte: la prima porta al modulo in pagina,
                  la seconda apre i canali diretti (WhatsApp, email, SMS). */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#contatti"
                  className="rounded-full bg-foreground px-7 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-background transition-colors hover:bg-flame hover:text-flame-foreground"
                >
                  Invia richiesta →
                </a>
                <ContactMenu className="rounded-full border border-white/25 bg-transparent px-7 py-3.5 text-[11px] text-foreground hover:border-flame hover:bg-transparent hover:text-flame" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 lg:col-span-6 lg:justify-items-end">
              <nav className="flex flex-col text-sm text-muted-foreground">
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} className="py-2 transition-colors hover:text-foreground">
                    {l.label}
                  </a>
                ))}
              </nav>
              <nav className="flex flex-col text-sm text-muted-foreground">
                <a
                  href="https://www.immobiliare.it/pro/382689/pone/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-2 transition-colors hover:text-foreground"
                >
                  Immobiliare.it <ArrowUpRight className="size-3" />
                </a>
                <a
                  href="https://wa.me/393457603610"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-2 transition-colors hover:text-foreground"
                >
                  WhatsApp <ArrowUpRight className="size-3" />
                </a>
                <a href="tel:+393457603610" className="py-2 transition-colors hover:text-foreground">
                  +39 345 760 3610
                </a>
              </nav>
            </div>
          </div>

          {/* sede e note legali */}
          <div className="mt-20 grid gap-6 text-sm text-muted-foreground lg:mt-28 lg:grid-cols-12 lg:items-end">
            <div className="flex flex-col gap-1 lg:col-span-6">
              <span>Via Toledo 265 — Napoli 80134</span>
              <span>C.C.I.A.A. Napoli — Ruolo Agenti di affari in mediazione n. 424903</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 lg:col-span-6 lg:justify-end">
              <a
                href="mailto:info@matricerealestate.it"
                className="transition-colors hover:text-foreground"
              >
                info@matricerealestate.it
              </a>
              <Link to="/privacy-policy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link to="/cookie-policy" className="transition-colors hover:text-foreground">
                Cookie
              </Link>
              <span>© 2026 Matrice Real Estate</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
