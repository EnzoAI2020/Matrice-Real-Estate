# Integrazione feed idealista/tools

Importa gli annunci pubblicati su idealista e li rende disponibili sulle
pagine `/immobili` e `/immobili/<slug>`.

## Architettura

```
idealista  ──FTP──►  GitHub Actions  ──REST──►  Cloudflare D1
(ftp.habitania.com)   (scarica, analizza,        (properties,
                       normalizza)                property_images,
                                                  idealista_syncs)
                                                        │
                                                   binding D1
                                                        ▼
                                             Worker del sito
                                          /immobili  /api/properties
```

**Perche' la sincronizzazione non gira dentro il sito.** Il sito e' un Worker
Cloudflare: l'FTP semplice sulla porta 21 richiede un canale di controllo piu'
un canale dati passivo su porta effimera, cosa che un Worker non fa in modo
affidabile. La sincronizzazione vive quindi dove Node e' completo (GitHub
Actions, o una macchina locale) e scrive su D1 via API REST. Il sito si limita
a leggere.

Il browser non parla mai con idealista e non vede mai le credenziali.

## Comandi

```bash
# Schema (una volta per database)
bun run idealista:migrate -- --local          # SQLite locale
bun run idealista:migrate                     # Cloudflare D1

# Importazione
bun run idealista:sync:local -- --file=scripts/idealista/__tests__/fixtures/feed-base.xml
bun run idealista:sync                        # da FTP verso D1

# Stato e test
bun run idealista:status -- --local
bun run idealista:test
```

### Opzioni principali

| Opzione | Default | Significato |
|---|---|---|
| `--file=PERCORSO` | — | XML locale invece dell'FTP |
| `--ftp` | — | Scarica da `ftp.habitania.com` |
| `--local` | — | SQLite in `.data/` invece di D1 |
| `--scope=0` | `0` | Scope pubblicabili, separati da virgola |
| `--max-photos=N` | `200` | Massimo foto per annuncio |
| `--trigger=NOME` | `manual` | Etichetta salvata nel registro |
| `--keep-raw` | — | Conserva l'annuncio grezzo in `raw_json` |
| `--no-deactivate` | — | Non disattiva gli assenti (utile al primo import) |
| `--dry-run` | — | Analizza e riporta senza scrivere |

## Credenziali

Mai nel codice, mai nel repository. In `.env` in locale (gia' in
`.gitignore`), nei secret di GitHub Actions in produzione. Copiare
`.env.example` e compilare.

Se le credenziali sono gia' passate da chat, email o screenshot, **vanno
rigenerate**.

## Le tre regole che contano

### 1. `scope` decide cosa si puo' pubblicare

| Valore | Significato | Pubblicabile |
|---|---|---|
| `0` | WEB_PUBLIC | si |
| `1` | MICROSITE_PRIVATE | no |
| `2` | NOT_PUBLISHED | no |

Il default e' `--scope=0`. **Non allargarlo** senza avere verificato con
idealista: pubblicare uno scope 2 significa mettere online un annuncio che il
proprietario ha chiesto di non pubblicare.

### 2. `addressVisible` decide quanto indirizzo si mostra

| Valore | Significato | Cosa esce dall'API |
|---|---|---|
| `0` | SHOW_ADDRESS | via, civico, mappa |
| `1` | ONLY_STREET_NAME | via e mappa, **niente civico** |
| `2` | HIDDEN_ADDRESS | solo la zona, **niente mappa** |

Con `HIDDEN_ADDRESS` spariscono anche le coordinate: una mappa con il
puntatore sull'edificio vanificherebbe la richiesta del venditore. I valori
esatti restano nelle colonne interne (`street`, `latitude`, `longitude`) per
la sincronizzazione, ma il repository legge solo le colonne `*_public` e
l'API non ha modo di esporli.

Se `addressVisible` manca, si assume il comportamento **piu' restrittivo**.

### 3. Gli enumerati sono interi, non parole

`<typology>0</typology>` non significa nulla da solo. Tutte le tabelle stanno
in `enums.mjs`, nell'ordine esatto del documento idealista.

**L'indice nell'array e' il valore inviato da idealista.** Non riordinare, non
rimuovere: si sfasa tutto. Per aggiungerne, si accoda.

Un valore fuori tabella non e' un errore: `decode()` conserva il grezzo in
`*_raw` e lascia null la chiave, cosi' un enum non documentato non corrompe il
dato ne' blocca l'importazione.

## Sicurezza della disattivazione

idealista invia un feed **completo** ogni giorno, non incrementale. Gli
immobili spariti dal feed vengono disattivati (`status='inactive'`), **mai
cancellati**.

La disattivazione non avviene se:

- il download o il parsing sono falliti;
- un qualunque immobile ha fallito la scrittura (`feedCompleto = false`);
- il feed non conteneva annunci pubblicabili;
- **la disattivazione riguarderebbe oltre il 50% degli attivi.**

L'ultima e' una valvola di sicurezza: una disattivazione di massa e' quasi
sempre il sintomo di un file parziale, non di un portafoglio svuotato in un
giorno. In quel caso il sync riesce, non disattiva nulla e lo scrive in
`idealista_syncs.notes`.

Un immobile che ricompare nel feed viene riattivato automaticamente.

## Idempotenza

La chiave di sincronizzazione e' `(source, idealista_id)`.
`externalReference` viene salvato ma non usato come chiave: e' il riferimento
interno dell'agenzia e puo' cambiare.

Ogni immobile porta un `content_hash`: se non cambia fra due sincronizzazioni
la riga non viene riscritta e l'esito e' `unchanged`.

Lo **slug resta stabile**: assegnato al primo inserimento, non cambia piu'
anche se cambiano descrizione o zona, cosi' l'URL pubblico non si rompe.

## File

| File | Ruolo |
|---|---|
| `cli.mjs` | Orchestrazione: migrate / sync / status |
| `ftp.mjs` | `IdealistaFtpClient` — elenco, selezione, download (via curl) |
| `xml.mjs` | Parser XML senza dipendenze, immune a XXE |
| `enums.mjs` | Mappatura enumerati → italiano |
| `normalize.mjs` | Annuncio grezzo → record, regole di filtro e visibilita' |
| `db.mjs` | Driver SQLite (locale) e D1 REST (produzione) |
| `sync.mjs` | Upsert, immagini, lock, disattivazione, statistiche |
| `logger.mjs` | Log strutturato con oscuramento dei segreti |
| `migrations/` | Schema SQL |
| `__tests__/` | 50 test su `node:test`, fixture inclusa |

Il parser e il client FTP sono scritti a mano invece di usare
`fast-xml-parser` e `basic-ftp` perche' aggiungere una dipendenza costringe a
reinstallare `node_modules`, e questo progetto ha una patch manuale in
`@lovable.dev/mcp-js` che ogni reinstallazione cancella (vedi
`ARCHIVE-INFO.md`).

## Sicurezza XML

Il parser non risolve **mai** entita' esterne. DOCTYPE, istruzioni di
elaborazione e commenti vengono rimossi prima dell'analisi e mai interpretati;
le uniche entita' riconosciute sono le cinque predefinite di XML piu' quelle
numeriche. Non esistendo un risolutore di entita', non c'e' la superficie
d'attacco XXE tipica dei parser generici mal configurati.

Le descrizioni provenienti dal feed sono rese come **testo**, mai come HTML:
non e' possibile iniettare markup o script da un annuncio.

## Test

```bash
bun run idealista:test
```

59 test su `node:test` (nessuna dipendenza). Girano su SQLite in memoria con
lo **schema reale**.

**Attenzione a cosa questo dimostra e cosa no.** D1 e' costruito su SQLite, ma
non e' SQLite: i test locali verificano che SQL, vincoli e logica siano
corretti, **non** che il comportamento di produzione sia identico. Le
differenze note sono trattate cosi':

| Aspetto | D1 | Come e' gestito |
|---|---|---|
| `BEGIN`/`COMMIT` espliciti | **non supportati** da `/query` | Rimossi: il batch manda gli statement in un'unica chiamata, che D1 esegue in transazione implicita |
| `PRAGMA` via API | non ammesse | Presenti solo nel driver SQLite locale, mai inviate a D1 |
| Parametri su piu' statement | `params` vale per un solo statement | Nel batch i valori sono interpolati con escape (test dedicato) |
| Latenza | ogni query e' una chiamata HTTP | L'upsert fa SELECT + INSERT/UPDATE: accettabile a queste quantita', da rivedere se il portafoglio cresce molto |
| `AUTOINCREMENT`, `IF NOT EXISTS`, FK con `ON DELETE CASCADE` | supportati | Usati; un test verifica che lo schema non contenga costrutti fuori dal sottoinsieme (`WITHOUT ROWID`, colonne generate, trigger, viste, `ATTACH`) |

Finche' il binding D1 non esiste, **nessun test ha girato contro D1 vero**.

Coprono: parsing residenziale/affitto/villa/capannone/ufficio, scelta della
lingua con ripiego, descrizione assente, ordinamento e assenza delle foto,
prezzo vendita/affitto/mancante, le tre visibilita' dell'indirizzo,
coordinate, creazione e aggiornamento senza duplicati, idempotenza delle
immagini, disattivazione sicura (feed completo, incompleto, vuoto, di massa),
lock di concorrenza e non esposizione delle credenziali nei log.

## Ancora da fare

- **Scheduler**: il workflow GitHub Actions non e' ancora stato creato (fase
  differita). Finche' non c'e', la sincronizzazione e' manuale.
- **Binding D1**: il Worker del sito deve ricevere il binding `IDEALISTA_DB`.
  Senza, le pagine mostrano lo stato "elenco non disponibile" invece di
  andare in errore.
- **Enumerati verificati sul feed reale** (scope, lingue, tipologie, energia):
  corrispondono alla specifica. Restano da confermare con idealista solo
  quelli non ancora comparsi nel feed.
- **Indirizzi nascosti**: nel feed reale non ce ne sono (tutti i 18 annunci
  sono `SHOW_ADDRESS`). La regola e' coperta dai test su fixture, ma non e'
  ancora stata esercitata su dati veri.
