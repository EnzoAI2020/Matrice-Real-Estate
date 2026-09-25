-- Migrazione 0001 — struttura per gli immobili importati da idealista/tools.
-- Destinazione: Cloudflare D1 (SQLite).
--
-- Applicare con:
--   wrangler d1 execute <DB> --local  --file=scripts/idealista/migrations/0001_idealista.sql
--   wrangler d1 execute <DB> --remote --file=scripts/idealista/migrations/0001_idealista.sql

-- ---------------------------------------------------------------- immobili --

CREATE TABLE IF NOT EXISTS properties (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Identita di origine. idealista_id e' la chiave di sincronizzazione:
  -- external_reference e' il riferimento interno dell'agenzia e puo' cambiare.
  source                  TEXT    NOT NULL DEFAULT 'idealista',
  idealista_id            TEXT    NOT NULL,
  external_reference      TEXT,
  slug                    TEXT    NOT NULL,

  -- Operazione e prezzo
  operation               TEXT,              -- sale | rent | rent_to_own
  price                   REAL,
  price_currency          TEXT    NOT NULL DEFAULT 'EUR',
  price_on_application    INTEGER NOT NULL DEFAULT 0,
  community_costs         REAL,
  deposit                 TEXT,

  -- Tipologia. property_type e' la chiave enum (HOME, WAREHOUSE, ...),
  -- property_type_label l'etichetta italiana gia' pronta per la UI.
  property_type           TEXT,
  property_type_raw       INTEGER,
  property_type_label     TEXT,
  property_subtype        TEXT,
  is_commercial           INTEGER NOT NULL DEFAULT 0,
  is_industrial           INTEGER NOT NULL DEFAULT 0,

  -- Testi
  title                   TEXT,
  description             TEXT,              -- italiano quando disponibile
  description_language    TEXT,
  description_is_fallback INTEGER NOT NULL DEFAULT 0,
  descriptions_json       TEXT,              -- tutte le lingue ricevute

  -- Superfici e vani
  property_area           REAL,
  usable_area             REAL,
  plot_area               REAL,
  rooms                   INTEGER,
  bedrooms                INTEGER,
  bathrooms               INTEGER,
  floor                   INTEGER,
  building_floors         INTEGER,
  construction_year       INTEGER,

  -- Indirizzo. Le colonne *_public rispettano addressVisible e sono le
  -- uniche che l'API e le pagine devono leggere; street/street_number e le
  -- coordinate esatte restano per la sincronizzazione e l'uso interno.
  address_visibility      TEXT,              -- SHOW_ADDRESS | ONLY_STREET_NAME | HIDDEN_ADDRESS
  street                  TEXT,
  street_number           TEXT,
  street_public           TEXT,
  street_number_public    TEXT,
  postal_code             TEXT,
  city                    TEXT,
  province                TEXT,
  zone                    TEXT,
  district                TEXT,
  country                 TEXT,
  latitude                REAL,
  longitude               REAL,
  coordinates_public      INTEGER NOT NULL DEFAULT 0,

  -- Dotazioni
  energy_certification    TEXT,
  energy_certification_raw INTEGER,
  has_terrace             INTEGER,
  has_balcony             INTEGER,
  has_garden              INTEGER,
  has_swimming_pool       INTEGER,
  has_lift                INTEGER,
  has_air_conditioning    INTEGER,
  has_box_room            INTEGER,
  has_wardrobe            INTEGER,
  has_parking             INTEGER,
  parking_included        INTEGER,
  parking_price           REAL,
  features_json           TEXT,              -- dotazioni gia' etichettate in italiano

  -- Stato e tracciamento
  status                  TEXT    NOT NULL DEFAULT 'active',   -- active | inactive
  scope                   INTEGER,
  images_count            INTEGER NOT NULL DEFAULT 0,

  source_created_at       TEXT,              -- <creation> del feed
  source_modified_at      TEXT,              -- <modification> del feed
  last_seen_sync_id       INTEGER,
  last_synced_at          TEXT,
  deactivated_at          TEXT,

  created_at              TEXT    NOT NULL,  -- data locale, non del feed
  updated_at              TEXT    NOT NULL,

  -- Impronta del contenuto normalizzato: se non cambia, l'annuncio e'
  -- "unchanged" e non serve riscrivere la riga.
  content_hash            TEXT,
  raw_json                TEXT               -- annuncio grezzo, per debug
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_source_id
  ON properties (source, idealista_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_slug
  ON properties (slug);
CREATE INDEX IF NOT EXISTS idx_properties_status     ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_operation  ON properties (operation);
CREATE INDEX IF NOT EXISTS idx_properties_type       ON properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_city       ON properties (city);
CREATE INDEX IF NOT EXISTS idx_properties_price      ON properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_listing
  ON properties (status, operation, property_type);

-- ----------------------------------------------------------------- immagini --

CREATE TABLE IF NOT EXISTS property_images (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id         INTEGER NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  idealista_image_id  TEXT,
  tag                 TEXT,                -- multimediaTag (VIEWS, KITCHEN, ...)
  url                 TEXT    NOT NULL,    -- multimediaPath
  position            INTEGER NOT NULL DEFAULT 0,
  width               INTEGER,
  height              INTEGER,
  created_at          TEXT    NOT NULL,
  updated_at          TEXT    NOT NULL
);

-- Evita duplicati a ogni sincronizzazione: una foto per annuncio e id remoto.
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_images_unique
  ON property_images (property_id, idealista_image_id);
CREATE INDEX IF NOT EXISTS idx_property_images_order
  ON property_images (property_id, position);

-- ------------------------------------------------------ registro dei sync --

CREATE TABLE IF NOT EXISTS idealista_syncs (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  status                TEXT    NOT NULL,   -- running | success | failed | aborted
  trigger               TEXT,               -- manual | scheduled | local
  started_at            TEXT    NOT NULL,
  completed_at          TEXT,
  source_filename       TEXT,
  source_bytes          INTEGER,
  records_received      INTEGER NOT NULL DEFAULT 0,
  records_created       INTEGER NOT NULL DEFAULT 0,
  records_updated       INTEGER NOT NULL DEFAULT 0,
  records_unchanged     INTEGER NOT NULL DEFAULT 0,
  records_skipped       INTEGER NOT NULL DEFAULT 0,
  records_deactivated   INTEGER NOT NULL DEFAULT 0,
  images_synced         INTEGER NOT NULL DEFAULT 0,
  duration_ms           INTEGER,
  errors                TEXT,               -- JSON array di messaggi
  notes                 TEXT
);

CREATE INDEX IF NOT EXISTS idx_syncs_started ON idealista_syncs (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_syncs_status  ON idealista_syncs (status);
