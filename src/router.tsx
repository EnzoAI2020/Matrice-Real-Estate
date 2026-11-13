import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  /*
   * Il primo render dopo il caricamento non deve toccare lo scroll.
   *
   * Anche con `scrollRestoration: false` il router, al primo render, esegue
   * comunque scrollTo(0, 0); con `scroll-behavior: smooth` in styles.css
   * questo diventava un'animazione verso la cima subito dopo che
   * RipristinaPosizione (__root.tsx) aveva riportato il lettore al suo posto.
   * L'unico modo pubblico per saltare quel reset e' la forma a funzione:
   * se restituisce false, il router non tocca lo scroll per quel render.
   *
   * - sul server: sempre false, cosi' non inietta il proprio script inline;
   * - sul client, primo render (reload): false, decide RipristinaPosizione;
   * - navigazioni successive: true, comportamento standard del router
   *   (pagina nuova in cima, "indietro" ritrova la posizione).
   */
  let primoRender = true;
  const gestisciScroll = () => {
    if (typeof window === "undefined") return false;
    if (primoRender) {
      primoRender = false;
      return false;
    }
    return true;
  };

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: gestisciScroll,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
