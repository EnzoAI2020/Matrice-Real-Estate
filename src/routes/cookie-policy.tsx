import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cookie-policy")({
  component: CookiePolicy,
  head: () => ({
    meta: [
      { title: "Cookie Policy — Matrice Group" },
      {
        name: "description",
        content:
          "Informativa sui cookie e sui servizi di terze parti utilizzati dal sito di Matrice Group, agenzia immobiliare di Napoli.",
      },
      { property: "og:title", content: "Cookie Policy — Matrice Group" },
      {
        property: "og:description",
        content:
          "Cookie tecnici, Google Fonts e gestione del consenso sul sito di Matrice Group.",
      },
    ],
  }),
});

function CookiePolicy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 lg:px-12 lg:py-32">
      <Link
        to="/"
        className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-flame"
      >
        ← Torna al sito
      </Link>
      <h1 className="mt-8 font-display text-[12vw] leading-[0.95] tracking-tight lg:text-6xl">
        Cookie Policy
      </h1>
      <div className="mt-12 space-y-8 text-base font-light leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-2xl text-foreground">Cosa sono i cookie</h2>
          <p className="mt-3">
            I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo
            dell'utente, dove vengono memorizzati per essere ritrasmessi agli stessi siti alla
            visita successiva. Tecnologie analoghe (localStorage) possono essere utilizzate per
            memorizzare preferenze sul dispositivo.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Cookie utilizzati da questo sito</h2>
          <p className="mt-3">
            Questo sito utilizza esclusivamente cookie e memorizzazioni tecniche necessarie al suo
            funzionamento, tra cui la registrazione della scelta espressa tramite il banner di
            consenso (voce <span className="font-mono text-xs">mg-cookie-consent</span>, conservata
            sul dispositivo dell'utente). Non sono utilizzati cookie di profilazione pubblicitaria.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Servizi di terze parti</h2>
          <p className="mt-3">
            Il sito carica i caratteri tipografici da Google Fonts (Google Ireland Ltd.). Il
            caricamento comporta la trasmissione dell'indirizzo IP dell'utente ai server di Google,
            che può avvenire anche verso Paesi extra UE sulla base delle garanzie previste dalla
            normativa europea. Rifiutando i servizi non essenziali tramite il banner, il sito viene
            visualizzato con i caratteri di sistema.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Gestione del consenso</h2>
          <p className="mt-3">
            Al primo accesso viene mostrato un banner che consente di accettare o rifiutare i
            servizi non essenziali. La scelta è memorizzata sul dispositivo e può essere modificata
            in qualsiasi momento cancellando i dati del sito dal proprio browser. È inoltre
            possibile impostare il browser per bloccare o eliminare i cookie.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Titolare del trattamento</h2>
          <p className="mt-3">
            Matrice Group, Via di Villanova 16, Napoli — iscritta al Ruolo Agenti di affari in
            mediazione presso la C.C.I.A.A. di Napoli al n. 424903. Email:{" "}
            <a href="mailto:info@matricegroup.com" className="text-flame">
              info@matricegroup.com
            </a>
            . Per il trattamento dei dati personali si rimanda alla{" "}
            <Link to="/privacy-policy" className="text-flame">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
          Ultimo aggiornamento: settembre 2026
        </p>
      </div>
    </div>
  );
}
