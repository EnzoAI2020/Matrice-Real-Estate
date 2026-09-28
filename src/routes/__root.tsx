import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CookieBanner } from "../components/CookieBanner";
import { WhatsAppWidget } from "../components/WhatsAppWidget";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Matrice Real Estate" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Chiave in sessionStorage: una posizione per percorso. */
const CHIAVE_POSIZIONE = "matrice:scroll:";

/**
 * Dopo un ricaricamento riporta esattamente dove si era.
 *
 * Due casi, in ordine di precedenza:
 *   1. l'URL ha un'ancora (#contatti)  -> si va a quella sezione
 *   2. nessuna ancora                  -> si riprende la posizione salvata
 *
 * Perche' non basta il browser: la pagina e' resa lato server e quando il
 * browser prova a ripristinare, il contenuto non e' ancora idratato e le
 * immagini non sono cariche. La pagina e' corta, il ripristino finisce
 * fuori bersaglio e poi il contenuto cresce sotto. Per questo si disattiva
 * il ripristino nativo e si rifa a mano, riprovando finche' l'altezza della
 * pagina si stabilizza.
 *
 * L'offset sotto l'header fisso e' gia' in CSS:
 * `section[id] { scroll-margin-top: 5.5rem }`.
 */
function RipristinaPosizione() {
  useEffect(() => {
    // Il ripristino nativo lavorerebbe contro il nostro: meglio spegnerlo.
    const precedente = history.scrollRestoration;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const chiave = CHIAVE_POSIZIONE + window.location.pathname;
    let annullato = false;

    /* --- salvataggio continuo della posizione, a basso costo --- */
    let inAttesa = false;
    const salva = () => {
      if (inAttesa) return;
      inAttesa = true;
      requestAnimationFrame(() => {
        inAttesa = false;
        try {
          sessionStorage.setItem(chiave, String(window.scrollY));
        } catch {
          /* sessionStorage puo' essere negato: non e' un motivo per rompere */
        }
      });
    };
    window.addEventListener("scroll", salva, { passive: true });
    window.addEventListener("pagehide", salva);

    /* --- ripristino ---
     *
     * Precedenza alla posizione salvata, non all'ancora.
     *
     * L'ancora resta nella barra degli indirizzi anche molto dopo che si e'
     * usato il menu: se vincesse lei, ogni ricaricamento riporterebbe alla
     * sezione cliccata mezz'ora prima invece che dove si stava leggendo.
     *
     * L'ancora serve a chi arriva da fuori con un link a una sezione: in
     * quel caso non c'e' nessuna posizione salvata e viene usata lei. */
    const ancora = window.location.hash;
    const idAncora = ancora.length > 1 ? decodeURIComponent(ancora.slice(1)) : null;

    let obiettivo: number | null = null;
    try {
      const salvata = sessionStorage.getItem(chiave);
      if (salvata !== null) obiettivo = Number(salvata);
    } catch {
      obiettivo = null;
    }
    const posizioneValida =
      obiettivo !== null && Number.isFinite(obiettivo) && obiettivo > 0;

    // L'ancora si usa solo se non sappiamo gia' dove si era.
    const id = posizioneValida ? null : idAncora;
    // Niente da ripristinare: si resta in cima, come e' giusto.
    if (!id && !posizioneValida) {
      return () => {
        window.removeEventListener("scroll", salva);
        window.removeEventListener("pagehide", salva);
        if ("scrollRestoration" in history) history.scrollRestoration = precedente;
      };
    }

    const vaiAPosto = () => {
      if (id) {
        const elemento = document.getElementById(id);
        if (!elemento) return false;
        // "auto" e non "smooth": a un reload si deve essere gia' li'.
        elemento.scrollIntoView({ block: "start", behavior: "auto" });
        return true;
      }
      // La posizione e' raggiungibile solo se la pagina e' cresciuta abbastanza.
      const massimo = document.documentElement.scrollHeight - window.innerHeight;
      if (massimo < obiettivo!) return false;
      window.scrollTo({ top: obiettivo!, behavior: "auto" });
      return true;
    };

    const scadenza = Date.now() + 3000;
    const riprova = () => {
      if (annullato) return;
      if (vaiAPosto()) {
        // Le immagini che finiscono di caricare spostano il layout: una
        // seconda passata rimette a posto.
        window.addEventListener(
          "load",
          () => {
            if (!annullato) vaiAPosto();
          },
          { once: true },
        );
        return;
      }
      if (Date.now() < scadenza) requestAnimationFrame(riprova);
    };
    requestAnimationFrame(riprova);

    return () => {
      annullato = true;
      window.removeEventListener("scroll", salva);
      window.removeEventListener("pagehide", salva);
      if ("scrollRestoration" in history) history.scrollRestoration = precedente;
    };
  }, []);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <RipristinaPosizione />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <CookieBanner />
      <WhatsAppWidget />
    </QueryClientProvider>
  );
}
