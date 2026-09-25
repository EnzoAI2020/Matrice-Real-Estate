# Form contatti — Google Apps Script

Endpoint che riceve il form del sito e invia due email:

1. **Notifica interna** a `info@matricerealestate.it` — template `notifica.html`
2. **Conferma automatica** a chi ha scritto — template `conferma.html`

## Installazione — file unico (consigliata)

`Codice-completo.gs` contiene **tutto**: logica + i due template HTML.
Un solo copia-incolla, nessun file aggiuntivo da creare.

1. Vai su [script.google.com](https://script.google.com) → **Nuovo progetto**.
   Accedi con l'account Google che possiede `info@matricerealestate.it`:
   le email partiranno da quell'indirizzo.
2. Nel file `Codice.gs` già presente, seleziona tutto (`function myFunction() {}`)
   e incolla il contenuto di **`Codice-completo.gs`**.
3. Salva. Fine: non servono file HTML separati.

## Installazione — versione a tre file (alternativa)

Più comoda se i template vanno modificati spesso.

| File | Tipo in Apps Script | Contenuto |
|---|---|---|
| `Codice.gs` | Script | Logica: validazione, compilazione template, invio |
| `notifica.html` | HTML | Email interna (`{{nome}}` `{{email}}` `{{oggetto}}` `{{messaggio}}`) |
| `conferma.html` | HTML | Email all'utente (`{{name}}` `{{oggetto}}`) |

Incolla `Codice.gs`, poi **+ → HTML** per creare `notifica` e `conferma`
(nomi esatti, senza `.html`) e incolla i rispettivi file.

> Usa **una** delle due installazioni, non entrambe.

## Autorizzazione

Dall'editor, seleziona la funzione `provaInvio` e premi **Esegui**.
Google chiede l'autorizzazione a inviare email: concedila.
Arriverà un'email di prova a `info@matricerealestate.it`.

Senza questo passaggio il primo invio reale fallisce.

## Distribuzione

**Distribuisci → Nuova distribuzione → tipo: App web**

- Descrizione: `form contatti`
- Esegui come: **Me**
- Chi ha accesso: **Chiunque** ← obbligatorio, altrimenti il sito riceve 401

Copia l'URL che termina con `/exec`.

## Collegare il sito

In `src/routes/index.tsx`, sostituisci il segnaposto:

```ts
const CONTACT_ENDPOINT =
  import.meta.env["VITE_CONTACT_ENDPOINT"] ?? "INCOLLA_QUI_URL_APPS_SCRIPT";
```

In alternativa, senza toccare il codice, crea un file `.env`:

```
VITE_CONTACT_ENDPOINT=https://script.google.com/macros/s/XXXX/exec
```

## Dopo ogni modifica

Le modifiche **non** sono attive finché non si crea una nuova versione:
**Distribuisci → Gestisci distribuzioni → matita → Versione: Nuova versione → Distribuisci**.
L'URL `/exec` resta lo stesso.

## Note

- **Quota email**: 100 destinatari al giorno con un account Gmail gratuito,
  1.500 con Google Workspace. Ogni richiesta ne consuma 2 (notifica + conferma).
- **Reply-To**: rispondendo alla notifica si scrive direttamente al cliente.
- **Honeypot**: il campo nascosto `website` blocca i bot più semplici; se
  compilato, l'endpoint risponde `ok` senza inviare nulla.
- **Immagini**: i template puntano al CDN di Canva
  (`0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email`). Se quegli URL
  scadono, le email arrivano senza immagini: conviene ricaricarle su un dominio
  stabile e aggiornare i `src`.
- **Log**: Apps Script → Esecuzioni, per vedere errori e invii.
