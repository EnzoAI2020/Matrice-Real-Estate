import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const STORAGE_KEY = "mg-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* storage non disponibile */
    }
  }, []);

  const decide = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage non disponibile */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 rounded-2xl border border-white/10 bg-card/95 p-6 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-sm font-light leading-relaxed text-muted-foreground">
          Utilizziamo cookie tecnici necessari al funzionamento del sito e servizi di terze parti
          (Google Fonts) che possono trattare il tuo indirizzo IP. Puoi accettare o rifiutare i
          servizi non essenziali. Maggiori informazioni nella{" "}
          <Link to="/cookie-policy" className="text-flame underline underline-offset-4">
            Cookie Policy
          </Link>{" "}
          e nella{" "}
          <Link to="/privacy-policy" className="text-flame underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => decide("rejected")}
            className="rounded-full border border-white/20 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-white/5"
          >
            Rifiuta
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-full bg-flame px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-flame-foreground transition-opacity hover:opacity-90"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
