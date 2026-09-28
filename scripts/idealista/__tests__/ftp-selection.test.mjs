/**
 * Selezione del file di feed sull'FTP.
 *
 * Nomi reali osservati su ftp.habitania.com per il destino Matrice: accanto
 * al feed degli annunci ci sono sei esportazioni di contorno. Sceglierle per
 * errore importerebbe zero immobili senza che nulla segnali il problema.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { IdealistaFtpClient, redigi } from "../ftp.mjs";

const ID = "ilc3e209dfc9628871ebfd42ddb5005cc61e6a4b812";

/** Elenco reale restituito dal server. */
const REALI = [
  `${ID}.xml`,
  `${ID}_Activities.xml`,
  `${ID}_Agents.xml`,
  `${ID}_Clients.xml`,
  `${ID}_Enquiries_2.xml`,
  `${ID}_Groups.xml`,
  `${ID}_Operations.xml`,
];

function client() {
  return new IdealistaFtpClient({ host: "ftp.esempio", user: "u", password: "p" });
}

test("sceglie il feed degli annunci fra i sette file reali", () => {
  assert.equal(client().selectFeedFile(REALI), `${ID}.xml`);
});

test("l'ordine dell'elenco non cambia la scelta", () => {
  const invertiti = [...REALI].reverse();
  assert.equal(client().selectFeedFile(invertiti), `${ID}.xml`);
});

test("non sceglie in base alla dimensione: decide il nome", () => {
  // Qui l'ausiliario verrebbe prima in ordine alfabetico; conta il suffisso.
  const file = [`${ID}_Agents.xml`, `${ID}.xml`];
  assert.equal(client().selectFeedFile(file), `${ID}.xml`);
});

test("un solo file viene preso senza altre analisi", () => {
  assert.equal(client().selectFeedFile(["qualsiasi.xml"]), "qualsiasi.xml");
});

test("nessun file: errore esplicito", () => {
  assert.throws(() => client().selectFeedFile([]), /Nessun file/);
});

test("solo ausiliari: si ferma invece di importarne uno", () => {
  const soloAusiliari = REALI.filter((n) => n !== `${ID}.xml`);
  assert.throws(
    () => client().selectFeedFile(soloAusiliari),
    /Nessun feed degli annunci/,
    "meglio fermarsi che importare gli agenti al posto degli immobili",
  );
});

test("due feed base con data nel nome: vince il piu' recente", () => {
  const file = ["feed-2026-09-24.xml", "feed-2026-09-25.xml"];
  assert.equal(client().selectFeedFile(file), "feed-2026-09-25.xml");
});

test("due feed base senza data: si ferma ed elenca i candidati", () => {
  assert.throws(
    () => client().selectFeedFile(["alfa.xml", "beta.xml"]),
    (e) => {
      assert.match(e.message, /ambigua/);
      assert.match(e.message, /alfa\.xml/);
      assert.match(e.message, /beta\.xml/);
      assert.match(e.message, /IDEALISTA_FTP_FILE/);
      return true;
    },
  );
});

test("gli ausiliari non rendono ambigua una scelta altrimenti chiara", () => {
  // Un solo feed base fra molti ausiliari: nessuna ambiguita'.
  const file = [...REALI, `${ID}_Extra.xml`, `${ID}_Altro_3.xml`];
  assert.equal(client().selectFeedFile(file), `${ID}.xml`);
});

test("i file non xml/json non entrano nella scelta", () => {
  // listFiles() filtra per estensione: qui si verifica il filtro a valle.
  const c = client();
  assert.equal(c.selectFeedFile([`${ID}.xml`]), `${ID}.xml`);
});

/* ------------------------------------------------------------ credenziali */

test("l'URL di base non contiene mai le credenziali", () => {
  const c = new IdealistaFtpClient({
    host: "ftp.habitania.com", port: 21, user: "utente123", password: "Segreta!",
  });
  assert.ok(!c.baseUrl.includes("utente123"));
  assert.ok(!c.baseUrl.includes("Segreta!"));
  assert.equal(c.baseUrl, "ftp://ftp.habitania.com:21/");
});

test("redigi() toglie utente e password dai messaggi", () => {
  const messaggio = redigi("530 Login incorrect for utente123 / Segreta!", "utente123", "Segreta!");
  assert.ok(!messaggio.includes("utente123"));
  assert.ok(!messaggio.includes("Segreta!"));
});

test("senza credenziali il client si rifiuta di partire", () => {
  assert.throws(
    () => new IdealistaFtpClient({ host: "x", user: "", password: "" }),
    /Credenziali FTP mancanti/,
  );
});
