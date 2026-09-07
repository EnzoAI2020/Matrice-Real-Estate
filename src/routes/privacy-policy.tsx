import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicy,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Matrice Group" },
      {
        name: "description",
        content:
          "Informativa sul trattamento dei dati personali di Matrice Group, agenzia di mediazione immobiliare con sede in Via di Villanova 16, Napoli.",
      },
      { property: "og:title", content: "Privacy Policy — Matrice Group" },
      {
        property: "og:description",
        content:
          "Come Matrice Group raccoglie e tratta i dati personali degli utenti del sito e dei clienti.",
      },
    ],
  }),
});

function PrivacyPolicy() {
  return <LegalPage title="Privacy Policy" />;
}

export function LegalPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 lg:px-12 lg:py-32">
      <Link
        to="/"
        className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-flame"
      >
        ← Torna al sito
      </Link>
      <h1 className="mt-8 font-display text-[12vw] leading-[0.95] tracking-tight lg:text-6xl">
        {title}
      </h1>
      <div className="mt-12 space-y-8 text-base font-light leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-2xl text-foreground">Titolare del trattamento</h2>
          <p className="mt-3">
            Titolare del trattamento è Matrice Group, agenzia di mediazione immobiliare iscritta al
            Ruolo Agenti di affari in mediazione presso la C.C.I.A.A. di Napoli al n. 424903, con
            sede in Via di Villanova 16, Napoli. Email:{" "}
            <a href="mailto:info@matricegroup.com" className="text-flame">
              info@matricegroup.com
            </a>
            .
          </p>

        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Dati raccolti</h2>
          <p className="mt-3">
            Attraverso il modulo di contatto presente sul sito raccogliamo nome e cognome, indirizzo
            email, oggetto della richiesta e contenuto del messaggio. Nell'ambito dell'attività di
            mediazione immobiliare possono essere trattati ulteriori dati forniti volontariamente
            dall'interessato (recapiti telefonici, dati anagrafici, dati relativi agli immobili).
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Finalità e base giuridica</h2>
          <p className="mt-3">
            I dati sono trattati per rispondere alle richieste di informazioni, per l'esecuzione di
            misure precontrattuali e contrattuali relative all'incarico di mediazione, e per
            l'adempimento di obblighi di legge (in particolare in materia fiscale e antiriciclaggio).
            La base giuridica è il consenso dell'interessato, l'esecuzione del contratto e
            l'obbligo legale.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Modalità e conservazione</h2>
          <p className="mt-3">
            Il trattamento avviene con strumenti informatici e cartacei, con misure di sicurezza
            adeguate. I dati raccolti tramite il modulo di contatto sono conservati per il tempo
            necessario a gestire la richiesta e, in caso di rapporto contrattuale, per i termini di
            legge previsti dalla normativa civilistica e fiscale.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Comunicazione a terzi</h2>
          <p className="mt-3">
            I dati possono essere comunicati a professionisti e collaboratori che supportano
            l'attività (tecnici, legali, notai, istituti di credito), a fornitori di servizi
            informatici che agiscono come responsabili del trattamento e alle autorità competenti
            quando previsto dalla legge. Non è previsto alcun trasferimento dei dati per finalità di
            marketing verso terzi.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Servizi di terze parti</h2>
          <p className="mt-3">
            Il sito utilizza i font web forniti da Google Fonts (Google Ireland Ltd.). Il
            caricamento dei font comporta la trasmissione dell'indirizzo IP dell'utente ai server di
            Google. Maggiori dettagli sono indicati nella{" "}
            <Link to="/cookie-policy" className="text-flame">
              Cookie Policy
            </Link>
            .
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground">Diritti dell'interessato</h2>
          <p className="mt-3">
            L'interessato può esercitare in ogni momento i diritti previsti dagli artt. 15-22 del
            Regolamento UE 2016/679: accesso, rettifica, cancellazione, limitazione, portabilità,
            opposizione e revoca del consenso, scrivendo a{" "}
            <a href="mailto:info@matricegroup.com" className="text-flame">
              info@matricegroup.com
            </a>
            . È inoltre possibile proporre reclamo al Garante per la protezione dei dati personali.
          </p>
        </section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
          Ultimo aggiornamento: settembre 2026
        </p>
      </div>
    </div>
  );
}
