/**
 * Matrice Real Estate — endpoint del form contatti.
 *
 * Riceve i dati del form dal sito, invia:
 *   1. la notifica interna a DESTINATARIO (template "notifica")
 *   2. la conferma automatica a chi ha scritto (template "conferma")
 *
 * File del progetto Apps Script:
 *   Codice.gs      questo file
 *   notifica.html  email interna
 *   conferma.html  email di conferma all'utente
 *
 * Deploy: Distribuisci > Nuova distribuzione > App web
 *   Esegui come: Me
 *   Chi ha accesso: Chiunque
 * Copia l'URL /exec e incollalo in CONTACT_ENDPOINT nel sito.
 */

const DESTINATARIO = "info@matricerealestate.it";
const NOME_MITTENTE = "Matrice Real Estate";
const CAMPI_OBBLIGATORI = ["nome", "email", "oggetto"];

/** Endpoint del form. */
function doPost(e) {
  try {
    const dati = leggiDati(e);

    // Honeypot: i bot compilano anche i campi nascosti. Fingiamo successo.
    if (String(dati.website || "").trim()) {
      return json({ ok: true });
    }

    const mancanti = CAMPI_OBBLIGATORI.filter(function (c) {
      return !String(dati[c] || "").trim();
    });
    if (mancanti.length) {
      return json({ ok: false, errore: "campi_mancanti", campi: mancanti });
    }
    if (!emailValida(dati.email)) {
      return json({ ok: false, errore: "email_non_valida" });
    }

    inviaNotifica(dati);

    // Se la conferma all'utente fallisce la richiesta resta comunque acquisita.
    try {
      inviaConferma(dati);
    } catch (errConferma) {
      console.error("Conferma non inviata: " + errConferma);
    }

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, errore: "errore_interno" });
  }
}

/** Utile solo per verificare che la distribuzione risponda. */
function doGet() {
  return json({ ok: true, stato: "attivo" });
}

/* ---------------------------------------------------------------- invio --- */

function inviaNotifica(dati) {
  const html = compila("notifica", {
    nome: dati.nome,
    email: dati.email,
    oggetto: dati.oggetto,
    messaggio: dati.messaggio,
  });

  MailApp.sendEmail({
    to: DESTINATARIO,
    replyTo: dati.email, // rispondendo si scrive direttamente al cliente
    subject: "Nuova richiesta dal sito — " + dati.oggetto + " — " + dati.nome,
    htmlBody: html,
    body: testoSemplice(dati),
    name: NOME_MITTENTE,
  });
}

function inviaConferma(dati) {
  const html = compila("conferma", {
    nome: dati.nome,
    name: dati.nome, // il template usa {{name}}
    email: dati.email,
    oggetto: dati.oggetto,
    messaggio: dati.messaggio,
  });

  MailApp.sendEmail({
    to: dati.email,
    replyTo: DESTINATARIO,
    subject: "Abbiamo ricevuto la tua richiesta — " + NOME_MITTENTE,
    htmlBody: html,
    body:
      "Gentile " +
      dati.nome +
      ",\n\nla ringraziamo per averci contattato. Abbiamo ricevuto la sua richiesta relativa a " +
      dati.oggetto +
      ".\nUn referente del nostro team la esaminera e la ricontattera per fornirle una prima valutazione.\n\nCordiali saluti,\nMATRICE team",
    name: NOME_MITTENTE,
  });
}

/* ---------------------------------------------------------------- utils --- */

/** Accetta sia JSON (text/plain, evita il preflight CORS) sia form-encoded. */
function leggiDati(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (errJson) {
      // non era JSON: si prosegue con i parametri
    }
  }
  return (e && e.parameter) || {};
}

function emailValida(valore) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valore).trim());
}

/** Sostituisce i {{segnaposto}} nel template, con escape dell'input utente. */
function compila(nomeFile, valori) {
  let html = HtmlService.createHtmlOutputFromFile(nomeFile).getContent();

  Object.keys(valori).forEach(function (chiave) {
    const grezzo = String(valori[chiave] == null ? "" : valori[chiave]).trim();
    const sicuro = chiave === "messaggio" ? nl2br(escapeHtml(grezzo)) : escapeHtml(grezzo);
    html = html.split("{{" + chiave + "}}").join(sicuro);
  });

  // Eventuali segnaposto rimasti non devono finire nell'email.
  return html.replace(/\{\{\s*[\w.-]+\s*\}\}/g, "");
}

/** Senza questo, un messaggio con tag HTML romperebbe il layout dell'email. */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(s) {
  return String(s).replace(/\r\n|\r|\n/g, "<br>");
}

function testoSemplice(dati) {
  return [
    "Nuova richiesta dal sito",
    "",
    "Nome e cognome: " + dati.nome,
    "Email: " + dati.email,
    "Oggetto: " + dati.oggetto,
    "",
    "Messaggio:",
    dati.messaggio || "(nessun messaggio)",
    "",
    "Ricevuta il " +
      Utilities.formatDate(new Date(), "Europe/Rome", "dd/MM/yyyy HH:mm") +
      " — matricerealestate.it",
  ].join("\n");
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/* ----------------------------------------------------------------- test --- */

/** Esegui questa funzione una volta dall'editor per autorizzare l'invio email. */
function provaInvio() {
  doPost({
    postData: {
      contents: JSON.stringify({
        nome: "Prova Prova",
        email: DESTINATARIO,
        oggetto: "Test endpoint",
        messaggio: "Messaggio di prova dal progetto Apps Script.",
      }),
    },
  });
}
