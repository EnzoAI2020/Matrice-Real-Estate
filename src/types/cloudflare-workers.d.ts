/**
 * Dichiarazione minima del modulo "cloudflare:workers".
 *
 * Esiste solo dentro il runtime dei Worker Cloudflare: in sviluppo (Node) e
 * in fase di typecheck non e' risolvibile. Il repository lo importa in modo
 * dinamico dentro un try/catch e ripiega su SQLite locale quando manca, ma
 * TypeScript ha comunque bisogno di sapere che forma ha.
 *
 * Non si usano i tipi ufficiali @cloudflare/workers-types per non aggiungere
 * una dipendenza: su questo progetto ogni reinstallazione di node_modules
 * cancella una patch manuale (vedi ARCHIVE-INFO.md).
 */
declare module "cloudflare:workers" {
  /** Risultato di una query D1. */
  interface D1Result<T = Record<string, unknown>> {
    results?: T[];
    success?: boolean;
    meta?: Record<string, unknown>;
  }

  interface D1PreparedStatement {
    bind: (...valori: unknown[]) => D1PreparedStatement;
    all: <T = Record<string, unknown>>() => Promise<D1Result<T>>;
    first: <T = Record<string, unknown>>() => Promise<T | null>;
    run: () => Promise<D1Result>;
  }

  interface D1Database {
    prepare: (sql: string) => D1PreparedStatement;
    batch: (statements: D1PreparedStatement[]) => Promise<D1Result[]>;
    exec: (sql: string) => Promise<{ count: number; duration: number }>;
  }

  /**
   * Binding esposti al Worker. IDEALISTA_DB e' il database D1 configurato
   * in wrangler; gli altri restano generici.
   */
  export const env: {
    IDEALISTA_DB?: D1Database;
  } & Record<string, unknown>;
}
