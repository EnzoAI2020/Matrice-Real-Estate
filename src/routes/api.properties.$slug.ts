import { createFileRoute } from "@tanstack/react-router";

import { immobilePerSlug } from "@/lib/properties/repository.server";

/**
 * GET /api/properties/:slug
 *
 * Solo immobili attivi. Un immobile disattivato (uscito dal feed) risponde
 * 404: non resta raggiungibile dall'API dopo essere sparito dal sito.
 */
export const Route = createFileRoute("/api/properties/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = String(params.slug ?? "").slice(0, 120);
        const immobile = await immobilePerSlug(slug);

        if (!immobile) {
          return new Response(
            JSON.stringify({ errore: "Immobile non trovato", slug }),
            {
              status: 404,
              headers: { "Content-Type": "application/json; charset=utf-8" },
            },
          );
        }

        return new Response(JSON.stringify(immobile), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=900",
          },
        });
      },
    },
  },
});
