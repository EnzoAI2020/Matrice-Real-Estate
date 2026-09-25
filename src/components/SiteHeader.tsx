import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import logo from "@/assets/logo-matrice-monogram.webp";

/**
 * Header delle pagine interne.
 *
 * Volutamente separato da quello della home: li' i link sono ancore locali
 * (#servizi), qui devono essere assoluti (/#servizi). La home non e' stata
 * toccata.
 */

const navLinks = [
  { href: "/#chi-siamo", label: "Chi siamo", interno: false },
  { href: "/#servizi", label: "Servizi", interno: false },
  { href: "/immobili", label: "Immobili", interno: true },
  { href: "/#team", label: "Team", interno: false },
  { href: "/#contatti", label: "Contatti", interno: false },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 " +
        (scrolled
          ? "border-white/10 bg-background/80 backdrop-blur-xl"
          : "border-white/10 bg-background/60 backdrop-blur-md")
      }
    >
      <div className="relative mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-12 lg:py-5">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 py-1">
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
        </Link>

        <nav className="hidden items-center gap-1 text-base text-foreground/75 lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2">
          {navLinks.map((l) =>
            l.interno ? (
              <Link
                key={l.href}
                to="/immobili"
                className="px-4 py-2.5 transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="px-4 py-2.5 transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <a
            href="https://wa.me/393457603610"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-3 py-3 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:border-flame hover:text-flame sm:px-4 lg:px-7 lg:py-4 lg:text-base"
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
          {navLinks.map((l) =>
            l.interno ? (
              <Link
                key={l.href}
                to="/immobili"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center border-b border-white/10 text-base text-foreground/85 transition-colors last:border-b-0 hover:text-flame"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center border-b border-white/10 text-base text-foreground/85 transition-colors last:border-b-0 hover:text-flame"
              >
                {l.label}
              </a>
            ),
          )}
        </nav>
      ) : null}
    </header>
  );
}
