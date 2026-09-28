# Handoff — Matrice Real Estate

Stato al 28/09/2026. Scritto per chi riprende il lavoro senza contesto.

---

## 1. Cos'e'

Sito vetrina di **Matrice Real Estate**, agenzia immobiliare di Napoli.
Sito singolo in italiano piu' due pagine di policy, piu' l'elenco degli
immobili importati dal feed di idealista.

**Percorso:** `C:\Users\Utente\Desktop\Project 456\matrice-wow-web`
**Repo:** `git@github-enzo:EnzoAI2020/Matrice-Real-Estate.git` (remote `origin`)
Il remote `lovable` punta al vecchio repo `ONEtechLORENZO/matrice-wow-web`:
**non pubblicare li'**.

### Stack

TanStack Start (React 19) + Vite 8 + Tailwind v4, build con nitro.
Gestore pacchetti **bun**. Nessun test runner esterno: si usa `node --test`.

Il progetto nasceva su **Lovable** (107 dei 112 commit sono del loro bot).
Il wrapper `@lovable.dev/vite-tanstack-config` e' stato rimosso: `vite.config.ts`
chiama ora direttamente i plugin. Resta `@lovable.dev/mcp-js`, che fornisce
la rotta `/mcp` ed e' una funzionalita', non un vincolo sul build.

---

## 2. Stato attuale

| | |
|---|---|
| Branch | `chore/eject-lovable-config` |
| Ultimo commit | `6d547be` |
| Avanti su `main` | 2 commit |
| File non committati | 0 |
| Test | **97 passano** |
| Typecheck | pulito |
| D1 | 18 immobili, 369 immagini |

**C'e' una pull request aperta (o da aprire) verso `main`.**
Il merge su `main` fa partire il deploy su GitHub Pages.

---

## 3. Cosa e' stato costruito

### Integrazione feed idealista (`scripts/idealista/`)

```
idealista (FTP)  ->  Cloudflare D1  ->  dump SQLite  ->  build  ->  Pages
```

| File | Ruolo |
|---|---|
| `cli.mjs` | comandi: `migrate`, `sync`, `status`, `dump` |
| `ftp.mjs` | client FTP (via `curl`, FTP semplice porta 21, niente TLS) |
| `xml.mjs` | parser XML senza dipendenze, non risolve entita' esterne |
| `enums.mjs` | mappatura degli enumerati idealista -> italiano |
| `normalize.mjs` | annuncio grezzo -> record, regole di filtro |
| `db.mjs` | driver SQLite locale e D1 via API REST |
| `sync.mjs` | upsert, immagini, lock, disattivazione, statistiche |
| `migrations/0001_idealista.sql` | schema: `properties`, `property_images`, `idealista_syncs` |

### Generazione statica (`scripts/static/export.mjs`)

Avvia il server costruito, chiede ogni pagina pubblica, salva l'HTML.
**Non** usa il prerenderer di TanStack/nitro: fallisce su Windows con
`spawn npx ENOENT`. L'elenco delle rotte arriva da `/api/properties` del
server appena avviato, cosi' non puo' disallinearsi dai dati veri.
Se una pagina non torna 200, l'export si ferma.

### Sito

- `src/routes/index.tsx` — home (una pagina, sezioni con ancore)
- `src/routes/immobili.index.tsx` — elenco con filtri
- `src/routes/immobili.$slug.tsx` — scheda immobile
- `src/routes/api.properties*.ts` — API pubblica
- `src/lib/properties/` — tipi, repository (solo server), server functions

---

## 4. Le tre regole che non vanno rotte

### scope

| valore | significato | pubblicabile |
|---|---|---|
| 0 | WEB_PUBLIC | si |
| 1 | MICROSITE_PRIVATE | no |
| 2 | NOT_PUBLISHED | no |

Default `--scope=0`. Un annuncio che passa a 1 o 2 viene **disattivato
subito**, anche con `--no-deactivate`: e' un'istruzione esplicita della
sorgente, diversa dall'assenza dal feed (che e' ambigua).

### addressVisible

| valore | cosa esce dall'API |
|---|---|
| 0 SHOW_ADDRESS | via, civico, mappa |
| 1 ONLY_STREET_NAME | via e mappa, **niente civico** |
| 2 HIDDEN_ADDRESS | solo zona, **niente mappa** |

Con HIDDEN_ADDRESS spariscono anche le coordinate. Se il campo manca si
assume il comportamento piu' restrittivo.

### Enumerati

Interi a base zero. Tabelle in `enums.mjs`, **l'indice nell'array e' il
valore inviato da idealista**: non riordinare. Valore fuori tabella ->
si conserva il grezzo in `*_raw` e la chiave resta null.

---

## 5. Limiti di D1 gia' scoperti (non reintrodurre)

Verificati contro il database reale:

- **Massimo 100 parametri legati per statement.** SQLite locale ne accetta
  32766, quindi il problema **non emerge dai test locali**. L'upsert delle
  immagini e' spezzato in lotti da 10; la cancellazione usa un confronto su
  `updated_at` invece di `NOT IN (lista)`.
- **Niente `BEGIN`/`COMMIT` espliciti**: l'endpoint `/query` li rifiuta.
- **Niente `PRAGMA`** via API.
- `changes` conta anche le righe cancellate in cascata (un DELETE di un
  padre con 3 figli riporta 4).

Tutti gli statement sono **parametrizzati**: nessun escaping scritto a mano.

---

## 6. Deploy

`.github/workflows/deploy.yml` — parte su push a `main` o manualmente.

```
install -> typecheck -> test -> sync FTP -> dump D1 -> build -> export -> Pages
```

Il passo FTP e' `continue-on-error: true`: se fallisce si pubblica quanto
gia' presente in D1, invece di bloccare il sito.

### Secret gia' configurati su GitHub (9)

```
CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN
IDEALISTA_FTP_HOST, IDEALISTA_FTP_PORT, IDEALISTA_FTP_USER,
IDEALISTA_FTP_PASSWORD, IDEALISTA_FTP_PATH
VITE_CONTACT_ENDPOINT
```

### Variabili (tab Variables, da verificare)

```
SITE_URL    = https://matricerealestate.it
SITE_DOMAIN = NON impostare finche' il DNS non punta a GitHub Pages
```

`SITE_DOMAIN` scrive un file `CNAME`: se impostato senza DNS, il sito
diventa irraggiungibile su entrambi gli indirizzi.

### Da fare prima del merge

- Settings -> Pages -> Source: **GitHub Actions**
- Variables -> `SITE_URL`

---

## 7. Comandi

```bash
bun run dev                      # server di sviluppo, porta 8080 (25-30s al primo avvio)
bun run build                    # build (preset cloudflare-module)
bun run typecheck
bun run idealista:test           # 97 test

# feed
bun run idealista:migrate        # applica lo schema (aggiungere --local per SQLite)
bun run idealista:sync           # da FTP verso D1
bun run idealista:status
bun run idealista:dump -- --to=.data/build.sqlite

# sito statico
NITRO_PRESET=node-server bun run build
IDEALISTA_DB_FILE=$PWD/.data/build.sqlite node scripts/static/export.mjs --out=dist
```

`.env` (non versionato) contiene credenziali Cloudflare, FTP e l'endpoint
del form. `.env.example` e' il modello.

---

## 8. Cosa resta aperto

### Bloccanti per la pubblicazione

1. **Merge della PR** — fa partire il primo deploy
2. **DNS su Aruba** — il dominio `matricerealestate.it` e' registrato li'
   (prodotto "Dominio con Email", **non** hosting: niente spazio web).
   Servono record A verso GitHub Pages, **lasciando intatti gli MX** o
   `info@matricerealestate.it` smette di ricevere.

### Decisi e volutamente non fatti

- **Disattivazione per assenza**: spenta (`--no-deactivate`). Il codice c'e'
  ed e' testato (casi A-H in `deactivation.test.mjs`), va solo approvata.
- **Scheduler giornaliero**: non aggiunto. Il workflow oggi parte solo su
  push o a mano.

### Domande aperte per idealista

- **L'account FTP e' limitato per IP?** I runner di GitHub cambiano
  indirizzo a ogni esecuzione: se c'e' un vincolo, la sincronizzazione in CI
  non funzionera' mai e serve un host con IP fisso.
- Sono disponibili **SFTP o FTPS**? Oggi la password viaggia in chiaro.
- A che ora viene generato il file? L'ultimo era delle 05:36.

### Sicurezza

- Le credenziali Cloudflare e FTP sono comparse in chiaro in una chat
  precedente. Il token Cloudflare e' stato ruotato una volta ma e' poi
  riapparso: **va ruotato di nuovo** e il secret su GitHub aggiornato.
- La password FTP e' esposta e **non e' rotabile senza idealista**.
- Il token Cloudflare ha ambito piu' ampio del necessario: riesce a
  elencare i Worker. Dovrebbe essere solo **D1 : Edit**.

### Difetti noti, non bloccanti

- `bun run lint` fallisce con ~5500 errori `Delete ␍`: tutto il repo e' in
  CRLF mentre prettier vuole LF. **Preesistente**, verificato anche su file
  mai toccati. Non lanciare `prettier --write`: riscriverebbe ogni file.
- Il badge FIAIP non c'e': l'immagine originale esisteva solo sul CDN di
  Lovable e non e' nel repository.
- Export statico tramite il prerenderer di TanStack/nitro: non funziona
  (`spawn npx ENOENT` su Windows). Si usa `scripts/static/export.mjs`.

---

## 9. Due file da non confondere

| File | Cos'e' |
|---|---|
| `C:\Users\Utente\Desktop\ilc3e209dfc...xml` | **feed reale** — publisher "Matrice Group Real Estate", 19 annunci, 18 scope 0 |
| `C:\Users\Utente\Downloads\ilcd403401...xml` | demo spagnola di idealista — "Ideal Agencia Inmobiliaria", Madrid, 0 scope 0 |

Prima di qualunque affermazione sul feed, controllare il publisher:

```bash
grep -o '<commercialName>[^<]*' <file>
```

Un audit e' gia' stato fatto per errore sul file sbagliato: le conclusioni
erano vere per quel file ma non per il feed di Matrice.

---

## 10. Riconciliazione del feed reale (verificata)

```
19 annunci  =  18 pubblicabili (scope 0)  +  1 escluso (scope 2)
371 foto    =  369 importate              +  2 dell'annuncio escluso

id escluso: 36845496 (scope 2, LAND) — 0 righe a database, 404 sul sito
```

Composizione: 11 capannoni, 5 appartamenti, 1 villa, 1 ufficio.
8 in vendita, 10 in affitto. Comuni: Napoli, Arzano, Volla, San Vitaliano,
Marigliano, Mariglianella, Frattamaggiore, Brusciano.

Idempotenza dimostrata: seconda esecuzione **0 creati, 18 invariati**,
nessun duplicato su `(source, idealista_id)`, `(property_id, image_id)`, slug.
