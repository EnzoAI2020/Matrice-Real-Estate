import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export type ServiceStep = { n: string; title: string; text: string };
export type ServiceFaq = { q: string; a: string };

type Props = {
  eyebrow: string;
  title: string;
  titleItalic: string;
  intro: string;
  image: string;
  imageAlt: string;
  paragrafi: string[];
  steps: ServiceStep[];
  perche: { title: string; text: string }[];
  faqs: ServiceFaq[];
  ctaText: string;
};

export function ServicePage({
  eyebrow,
  title,
  titleItalic,
  intro,
  image,
  imageAlt,
  paragrafi,
  steps,
  perche,
  faqs,
  ctaText,
}: Props) {
  return (
    <div className="min-h-svh bg-background text-foreground antialiased">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 lg:px-12">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            MATRICE<span className="font-light italic opacity-70">GROUP</span>
          </Link>
          <nav className="hidden items-center gap-7 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/70 md:flex">
            <Link to="/compravendita" className="transition-colors hover:text-flame">
              Compravendita
            </Link>
            <Link to="/locazioni" className="transition-colors hover:text-flame">
              Locazioni
            </Link>
            <Link to="/aste-e-npl" className="transition-colors hover:text-flame">
              Aste e NPL
            </Link>
            <Link to="/investimenti" className="transition-colors hover:text-flame">
              Investimenti
            </Link>
            <a
              href="https://www.immobiliare.it/pro/382689/pone/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-flame"
            >
              Immobili
            </a>
          </nav>
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

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background" />
        </div>
        <div className="relative mx-auto max-w-[1600px] px-6 py-24 lg:px-12 lg:py-32">
          <p className="mb-7 flex items-center gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-flame">
            <span className="h-px w-10 bg-flame" />
            {eyebrow}
          </p>
          <h1 className="max-w-4xl font-display text-[11vw] leading-[0.95] tracking-tight lg:text-[6rem]">
            {title} <span className="font-light italic text-flame">{titleItalic}</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg font-light leading-relaxed text-foreground/75">
            {intro}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-6 py-20 lg:px-12 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="space-y-6 text-lg font-light leading-relaxed text-muted-foreground lg:col-span-7">
            {paragrafi.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-card/70 p-8 backdrop-blur-xl lg:p-10">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-flame">
                Perché Matrice Group
              </p>
              <ul className="mt-7 space-y-6">
                {perche.map((v) => (
                  <li key={v.title} className="border-t border-white/10 pt-5 first:border-0 first:pt-0">
                    <p className="font-display text-2xl tracking-tight">{v.title}</p>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{v.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* PROCESSO */}
        <h2 className="mt-24 font-display text-[9vw] leading-[0.95] tracking-tight lg:text-[4.5rem]">
          Il <span className="font-light italic text-flame">processo</span>
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <article key={s.n} className="bg-background/85 p-9 backdrop-blur-sm">
              <span className="font-mono text-[11px] text-flame">/ {s.n}</span>
              <h3 className="mt-4 font-display text-2xl tracking-tight">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{s.text}</p>
            </article>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="mt-24 font-display text-[9vw] leading-[0.95] tracking-tight lg:text-[4.5rem]">
          Domande <span className="font-light italic text-flame">frequenti</span>
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border border-white/10 bg-card/60 p-8 backdrop-blur-xl">
              <h3 className="font-display text-2xl leading-tight tracking-tight">{f.q}</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-24 rounded-2xl bg-flame p-10 text-flame-foreground lg:p-14">
          <p className="max-w-3xl font-display text-3xl font-light leading-snug lg:text-4xl">
            {ctaText}
          </p>
          <div className="mt-9 flex flex-wrap gap-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
            <Link
              to="/"
              hash="contatti"
              className="inline-flex items-center gap-3 rounded-full bg-background px-8 py-4 text-foreground transition-opacity hover:opacity-85"
            >
              Richiedi una consulenza <ArrowRight className="size-4" />
            </Link>
            <a
              href="tel:+393457603610"
              className="inline-flex items-center rounded-full border border-flame-foreground/40 px-8 py-4 transition-colors hover:bg-flame-foreground hover:text-flame"
            >
              345 760 3610
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground lg:px-12">
          <span>Matrice Group · C.C.I.A.A. Napoli n. 424903</span>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="transition-colors hover:text-flame">
              Privacy Policy
            </Link>
            <Link to="/cookie-policy" className="transition-colors hover:text-flame">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function faqJsonLd(faqs: ServiceFaq[]) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}
