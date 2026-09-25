/**
 * Matrice Real Estate — endpoint del form contatti.
 *
 * Riceve i dati del form dal sito, invia:
 *   1. la notifica interna a DESTINATARIO (template "notifica")
 *   2. la conferma automatica a chi ha scritto (template "conferma")
 *
 * Tutto in un unico file: i due template HTML sono costanti qui sotto.
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

/* ------------------------------------------------------------ template --- */

/** Email interna verso DESTINATARIO. */
const HTML_NOTIFICA = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="format-detection" content="telephone=no, date=no, address=no, email=no"><meta name="x-apple-disable-message-reformatting"><style>body{margin:0;padding:0}table{mso-table-lspace:0;mso-table-rspace:0}p,span,h1,h2,h3,h4,h5,h6{margin:0;padding:0}p{line-height:inherit}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}#MessageViewBody a{color:inherit;text-decoration:none}img+div{display:none}@media (max-width:599px){.ecw{width:100%!important;min-width:0!important}}</style><!--[if mso]><div>
                <noscript>
                  <xml>
                    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
                      <w:DontUseAdvancedTypographyReadingMail/>
                    </w:WordDocument>
                    <o:OfficeDocumentSettings>
                      <o:AllowPNG/>
                      <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                  </xml>
                </noscript></div><![endif]--><!--[if !mso]><!--><style>@media (max-width:200px){
.l0-c0,.l0-c1,.l0-c2{display:block!important;width:100%!important}
.l0-s0,.l0-s1{display:block!important;width:auto!important;height:16px;font-size:0}
.layout-0 .ebi-mw-200{max-width:200px!important}
.layout-0 .ebi-mw-200 img{width:100%!important}
}</style><!--<![endif]--><!--[if !mso]><!--><style>@media (max-width:200px){
.l1-c0,.l1-c1,.l1-c2{display:block!important;width:100%!important}
.l1-s0,.l1-s1{display:block!important;width:auto!important;height:16px;font-size:0}
.layout-1 .ebi-mw-200{max-width:200px!important}
.layout-1 .ebi-mw-200 img{width:100%!important}
}</style><!--<![endif]--><!--[if !mso]><!--><style>@media (max-width:450px){
.l2-c0,.l2-c1{display:block!important;width:100%!important}
.l2-s0{display:block!important;width:auto!important;height:16px;font-size:0}
}</style><!--<![endif]--><style>@media(max-width:550px){.ers-fs-170{font-size:16.5px!important}.ers-fs-187{font-size:17.4px!important}.ers-fs-210{font-size:18.5px!important}.ers-fs-237{font-size:19.9px!important}.ers-fs-240{font-size:20px!important}.ers-fs-250{font-size:20.5px!important}}</style></head><body style="width:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;background-color:#f0f1f5;margin:0;padding:0"><table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f0f1f5" style="background-color:#f0f1f5"><tbody><tr><td style="background-color:#f0f1f5"><!--[if mso]><center>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                      <tbody>
                        <tr>
                          <td><![endif]--><table align="center" width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" class="ecw" style="max-width:600px;min-height:600px;margin:0 auto;background-color:#ffffff;width:600px;min-width:600px"><tbody><tr><td style="vertical-align:top"></td></tr><tr><td style="vertical-align:top;padding:0px
           0px
           0px
           0px"><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"><tbody><tr><td style="vertical-align:top"><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td style="padding:24px 24px 16px"><table border="0" cellpadding="0" cellspacing="0" class="layout-0" align="center" style="display:table;border-spacing:0px;border-collapse:separate;width:100%;max-width:100%;table-layout:fixed;margin:0 auto"><tbody><tr><td style="text-align:center"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;max-width:552px;table-layout:fixed;margin:0 auto"><tbody><tr><td width="10.00%" class="l0-c0" style="width:10.00%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td><table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" class="ebi ebi-mw-200" style="width:100%;max-width:56px"><tbody><tr><td style="width:100%"><img src="https://0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email/47c826dd7dba873c8fe024e97728ef94.png" width="56" height="51" style="display:block;width:56px;height:auto;max-width:100%"></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td><td width="0" class="l0-s0" style="width:0;box-sizing:border-box;font-size:0">&nbsp;</td><td width="65.72%" class="l0-c1" style="width:65.72%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" class="ers-fs-250" style="color:#0d3050;font-size:25px;font-weight:700;white-space:pre-wrap;text-align:left;line-height:1.4;mso-line-height-alt:35px">      Nuova richiesta dal sito<br></td></tr></tbody></table></td></tr></tbody></table></td><td width="0" class="l0-s1" style="width:0;box-sizing:border-box;font-size:0">&nbsp;</td><td width="24.28%" class="l0-c2" style="width:24.28%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:left;padding:0px 0px 16px;line-height:1.4;mso-line-height-alt:22.4px;text-decoration:none">&nbsp;</td></tr><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:left;line-height:1.4;mso-line-height-alt:22.4px;text-decoration:none">&nbsp;</td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td dir="ltr" class="ers-fs-210" style="font-size:21px;white-space:pre-wrap;text-align:left;padding:0px 24px 16px;line-height:1.4;mso-line-height-alt:29.4px;text-decoration:none">&nbsp;</td></tr><tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0px 24px 16px;line-height:1.3;mso-line-height-alt:20.8px"><span class="ers-fs-170" style="font-size:17px;font-weight:700;white-space:pre-wrap">Nome e cognome:</span><span class="ers-fs-170" style="font-size:17px;white-space:pre-wrap"> </span><span class="ers-fs-237" style="font-size:23.7px;font-weight:700;color:#004aad;white-space:pre-wrap">{{nome}}</span><br></td></tr><tr><td dir="ltr" class="ers-fs-170" style="font-size:17px;text-align:left;padding:0px 24px 16px;line-height:1.3;mso-line-height-alt:22.1px"><span style="font-weight:700;white-space:pre-wrap">Email:</span><span style="white-space:pre-wrap"> {{email}}</span><br></td></tr><tr><td dir="ltr" class="ers-fs-170" style="font-size:17px;text-align:left;padding:0px 24px 16px;line-height:1.3;mso-line-height-alt:22.1px"><span style="font-weight:700;white-space:pre-wrap">Oggetto:</span><span style="white-space:pre-wrap"> {{oggetto}}</span><br></td></tr><tr><td dir="ltr" class="ers-fs-170" style="font-size:17px;text-align:left;padding:0px 24px 16px;line-height:1.3;mso-line-height-alt:22.1px"><span style="font-weight:700;white-space:pre-wrap">Messaggio:</span><br></td></tr><tr><td dir="ltr" class="ers-fs-170" style="font-size:17px;text-align:left;padding:0px 24px 16px;line-height:1.3;mso-line-height-alt:22.1px">{{messaggio}}<br></td></tr><tr><td dir="ltr" class="ers-fs-187" style="font-size:18.7px;white-space:pre-wrap;text-align:left;padding:0px 24px 16px;line-height:1.3;mso-line-height-alt:24.3px;text-decoration:none">&nbsp;</td></tr><tr><td style="padding:0px 24px 16px"><table border="0" cellpadding="0" cellspacing="0" class="layout-1" align="center" style="display:table;border-spacing:0px;border-collapse:separate;width:100%;max-width:100%;table-layout:fixed;margin:0 auto"><tbody><tr><td style="text-align:center"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;max-width:552px;table-layout:fixed;margin:0 auto"><tbody><tr><td width="10.00%" class="l1-c0" style="width:10.00%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td><table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" class="ebi ebi-mw-200" style="width:100%;max-width:56px"><tbody><tr><td style="width:100%"><img src="https://0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email/d29ef4c6e2ec12e0e4d7f839f6550bd2.png" width="56" height="51" style="display:block;width:56px;height:auto;max-width:100%"></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td><td width="0" class="l1-s0" style="width:0;box-sizing:border-box;font-size:0">&nbsp;</td><td width="56.67%" class="l1-c1" style="width:56.67%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" class="ers-fs-240" style="color:#0d3050;font-size:24px;text-align:left;line-height:1.4;mso-line-height-alt:33.6px"><span style="font-weight:700;white-space:pre-wrap">MATRICE </span><span style="font-weight:300;font-style:italic;white-space:pre-wrap">REAL ESTATE</span><br></td></tr></tbody></table></td></tr></tbody></table></td><td width="0" class="l1-s1" style="width:0;box-sizing:border-box;font-size:0">&nbsp;</td><td width="33.33%" class="l1-c2" style="width:33.33%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:left;padding:0px 0px 16px;line-height:1.4;mso-line-height-alt:22.4px;text-decoration:none">&nbsp;</td></tr><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:left;line-height:1.4;mso-line-height-alt:22.4px;text-decoration:none">&nbsp;</td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="padding:0px 24px 16px"><table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:552px"><tbody><tr><td style="width:100%"><img src="https://0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email/6111f216850cbe89213e40a5ec09540b.png" width="552" height="63" style="display:block;width:552px;height:auto;max-width:100%"></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="padding:0px 24px 24px"><table border="0" cellpadding="0" cellspacing="0" class="layout-2" align="center" style="display:table;border-spacing:0px;border-collapse:separate;width:100%;max-width:100%;table-layout:fixed;margin:0 auto"><tbody><tr><td style="text-align:center"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;max-width:552px;table-layout:fixed;margin:0 auto"><tbody><tr><td width="48.55%" class="l2-c0" style="width:48.55%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" style="font-size:14px;white-space:pre-wrap;text-align:left;line-height:20.8px;mso-line-height-alt:20.8px">Via Toledo 265 — Napoli 80134<br>C.C.I.A.A. Napoli — Ruolo Agenti di affari in mediazione n. 424903<br></td></tr></tbody></table></td></tr></tbody></table></td><td width="16" class="l2-s0" style="width:16px;box-sizing:border-box;font-size:0">&nbsp;</td><td width="48.55%" class="l2-c1" style="width:48.55%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" style="font-size:14px;text-align:left;line-height:20.8px;mso-line-height-alt:20.8px"><a href="https://www.immobiliare.it/pro/382689/pone/" target="_blank" rel="noopener nofollow" style="color:#1a62ff;text-decoration:inherit"><span style="text-decoration:underline;color:#1a62ff;white-space:pre-wrap">Immobiliare.it</span></a><br><a href="https://wa.me/393457603610" target="_blank" rel="noopener noreferrer" style="color:#1a62ff;text-decoration:inherit"><span style="text-decoration:underline;color:#1a62ff;white-space:pre-wrap">WhatsApp</span></a><br><a href="tel:+393457603610" target="_blank" rel="noopener noreferrer" style="color:#000000;text-decoration:none">+39 345 760 3610</a><br></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td height="100%" style="height:100%;font-size:0;line-height:0" aria-hidden="true">&nbsp;</td></tr></tbody></table><!--[if mso]></td>
                </tr>
              </tbody>
            </table>
          </center><![endif]--></td></tr></tbody></table></body></html>`;

/** Email di conferma verso chi ha compilato il form. */
const HTML_CONFERMA = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="format-detection" content="telephone=no, date=no, address=no, email=no"><meta name="x-apple-disable-message-reformatting"><style>body{margin:0;padding:0}table{mso-table-lspace:0;mso-table-rspace:0}p,span,h1,h2,h3,h4,h5,h6{margin:0;padding:0}p{line-height:inherit}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}#MessageViewBody a{color:inherit;text-decoration:none}img+div{display:none}@media (max-width:599px){.ecw{width:100%!important;min-width:0!important}}</style><!--[if mso]><div>
                <noscript>
                  <xml>
                    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
                      <w:DontUseAdvancedTypographyReadingMail/>
                    </w:WordDocument>
                    <o:OfficeDocumentSettings>
                      <o:AllowPNG/>
                      <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                  </xml>
                </noscript></div><![endif]--><!--[if !mso]><!--><style>@media (max-width:200px){
.l0-c0,.l0-c1,.l0-c2{display:block!important;width:100%!important}
.l0-s0,.l0-s1{display:block!important;width:auto!important;height:16px;font-size:0}
.layout-0 .ebi-mw-200{max-width:200px!important}
.layout-0 .ebi-mw-200 img{width:100%!important}
}</style><!--<![endif]--><!--[if !mso]><!--><style>@media (max-width:200px){
.l1-c0,.l1-c1,.l1-c2{display:block!important;width:100%!important}
.l1-s0,.l1-s1{display:block!important;width:auto!important;height:16px;font-size:0}
.layout-1 .ebi-mw-200{max-width:200px!important}
.layout-1 .ebi-mw-200 img{width:100%!important}
}</style><!--<![endif]--><!--[if !mso]><!--><style>@media (max-width:450px){
.l2-c0,.l2-c1{display:block!important;width:100%!important}
.l2-s0{display:block!important;width:auto!important;height:16px;font-size:0}
}</style><!--<![endif]--><style>@media(max-width:550px){.ers-fs-187{font-size:17.4px!important}.ers-fs-209{font-size:18.5px!important}.ers-fs-210{font-size:18.5px!important}.ers-fs-227{font-size:19.4px!important}.ers-fs-240{font-size:20px!important}}</style></head><body style="width:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;background-color:#f0f1f5;margin:0;padding:0"><table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f0f1f5" style="background-color:#f0f1f5"><tbody><tr><td style="background-color:#f0f1f5"><!--[if mso]><center>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                      <tbody>
                        <tr>
                          <td><![endif]--><table align="center" width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" class="ecw" style="max-width:600px;min-height:600px;margin:0 auto;background-color:#ffffff;width:600px;min-width:600px"><tbody><tr><td style="vertical-align:top"></td></tr><tr><td style="vertical-align:top;padding:0px
           0px
           0px
           0px"><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"><tbody><tr><td style="vertical-align:top"><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td style="padding:24px 24px 16px"><table border="0" cellpadding="0" cellspacing="0" class="layout-0" align="center" style="display:table;border-spacing:0px;border-collapse:separate;width:100%;max-width:100%;table-layout:fixed;margin:0 auto"><tbody><tr><td style="text-align:center"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;max-width:552px;table-layout:fixed;margin:0 auto"><tbody><tr><td width="10.00%" class="l0-c0" style="width:10.00%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td><table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" class="ebi ebi-mw-200" style="width:100%;max-width:56px"><tbody><tr><td style="width:100%"><img src="https://0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email/47c826dd7dba873c8fe024e97728ef94.png" width="56" height="51" style="display:block;width:56px;height:auto;max-width:100%"></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td><td width="0" class="l0-s0" style="width:0;box-sizing:border-box;font-size:0">&nbsp;</td><td width="56.67%" class="l0-c1" style="width:56.67%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" class="ers-fs-240" style="color:#0d3050;font-size:24px;text-align:left;line-height:1.4;mso-line-height-alt:33.6px"><span style="font-weight:700;white-space:pre-wrap">MATRICE </span><span style="font-weight:300;font-style:italic;white-space:pre-wrap">REAL ESTATE</span><br></td></tr></tbody></table></td></tr></tbody></table></td><td width="0" class="l0-s1" style="width:0;box-sizing:border-box;font-size:0">&nbsp;</td><td width="33.33%" class="l0-c2" style="width:33.33%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:left;padding:0px 0px 16px;line-height:1.4;mso-line-height-alt:22.4px;text-decoration:none">&nbsp;</td></tr><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:left;line-height:1.4;mso-line-height-alt:22.4px;text-decoration:none">&nbsp;</td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="padding:0px 0px 16px"><table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px"><tbody><tr><td style="width:100%"><img src="https://0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email/468d45fac793bd35e7974eab42d1d495.jpg" width="600" height="431" style="display:block;width:600px;height:auto;max-width:100%"></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td dir="ltr" style="font-size:12px;white-space:pre-wrap;text-align:left;padding:0px 24px 16px;line-height:22.4px;mso-line-height-alt:22.4px;text-decoration:none">&nbsp;</td></tr><tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0px 24px 16px;line-height:1.3;mso-line-height-alt:20.8px"><span class="ers-fs-210" style="font-size:21px;white-space:pre-wrap">Gentile </span><span class="ers-fs-227" style="font-size:22.7px;font-weight:700;color:#0d3050;white-space:pre-wrap">{{name}}</span><span class="ers-fs-210" style="font-size:21px;white-space:pre-wrap">,</span><br></td></tr><tr><td dir="ltr" class="ers-fs-210" style="font-size:21px;white-space:pre-wrap;text-align:left;padding:0px 24px 16px;line-height:1.3;mso-line-height-alt:27.3px">la ringraziamo per averci contattato. Abbiamo ricevuto la sua richiesta relativa a {{oggetto}}.<br></td></tr><tr><td dir="ltr" class="ers-fs-210" style="font-size:21px;white-space:pre-wrap;text-align:left;padding:0px 24px 16px;line-height:1.3;mso-line-height-alt:27.3px">Un referente del nostro team la esaminerà e la ricontatterà per fornirle una prima valutazione.<br></td></tr><tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0px 24px 16px;line-height:1.3;mso-line-height-alt:20.8px"><span class="ers-fs-210" style="font-size:21px;white-space:pre-wrap">Cordiali saluti,<br></span><span class="ers-fs-209" style="font-size:20.9px;white-space:pre-wrap">MATRICE</span><span class="ers-fs-210" style="font-size:21px;white-space:pre-wrap"> team</span><br></td></tr><tr><td dir="ltr" class="ers-fs-187" style="font-size:18.7px;white-space:pre-wrap;text-align:left;padding:0px 24px 16px;line-height:1.3;mso-line-height-alt:24.3px;text-decoration:none">&nbsp;</td></tr><tr><td style="padding:0px 24px 16px"><table border="0" cellpadding="0" cellspacing="0" class="layout-1" align="center" style="display:table;border-spacing:0px;border-collapse:separate;width:100%;max-width:100%;table-layout:fixed;margin:0 auto"><tbody><tr><td style="text-align:center"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;max-width:552px;table-layout:fixed;margin:0 auto"><tbody><tr><td width="10.00%" class="l1-c0" style="width:10.00%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td><table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" class="ebi ebi-mw-200" style="width:100%;max-width:56px"><tbody><tr><td style="width:100%"><img src="https://0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email/d29ef4c6e2ec12e0e4d7f839f6550bd2.png" width="56" height="51" style="display:block;width:56px;height:auto;max-width:100%"></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td><td width="0" class="l1-s0" style="width:0;box-sizing:border-box;font-size:0">&nbsp;</td><td width="56.67%" class="l1-c1" style="width:56.67%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" class="ers-fs-240" style="color:#0d3050;font-size:24px;text-align:left;line-height:1.4;mso-line-height-alt:33.6px"><span style="font-weight:700;white-space:pre-wrap">MATRICE </span><span style="font-weight:300;font-style:italic;white-space:pre-wrap">REAL ESTATE</span><br></td></tr></tbody></table></td></tr></tbody></table></td><td width="0" class="l1-s1" style="width:0;box-sizing:border-box;font-size:0">&nbsp;</td><td width="33.33%" class="l1-c2" style="width:33.33%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:left;padding:0px 0px 16px;line-height:1.4;mso-line-height-alt:22.4px;text-decoration:none">&nbsp;</td></tr><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:left;line-height:1.4;mso-line-height-alt:22.4px;text-decoration:none">&nbsp;</td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="padding:0px 24px 16px"><table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:552px"><tbody><tr><td style="width:100%"><img src="https://0wlrsgrnxygpaqsuekgapipp_non2jhzqw6lly0gr6o.canva-cdn.email/6111f216850cbe89213e40a5ec09540b.png" width="552" height="63" style="display:block;width:552px;height:auto;max-width:100%"></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="padding:0px 24px 24px"><table border="0" cellpadding="0" cellspacing="0" class="layout-2" align="center" style="display:table;border-spacing:0px;border-collapse:separate;width:100%;max-width:100%;table-layout:fixed;margin:0 auto"><tbody><tr><td style="text-align:center"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;max-width:552px;table-layout:fixed;margin:0 auto"><tbody><tr><td width="48.55%" class="l2-c0" style="width:48.55%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" style="font-size:14px;white-space:pre-wrap;text-align:left;line-height:20.8px;mso-line-height-alt:20.8px">Via Toledo 265 — Napoli 80134<br>C.C.I.A.A. Napoli — Ruolo Agenti di affari in mediazione n. 424903<br></td></tr></tbody></table></td></tr></tbody></table></td><td width="16" class="l2-s0" style="width:16px;box-sizing:border-box;font-size:0">&nbsp;</td><td width="48.55%" class="l2-c1" style="width:48.55%;box-sizing:border-box;vertical-align:middle"><table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed"><tbody><tr><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" style="font-size:14px;text-align:left;line-height:20.8px;mso-line-height-alt:20.8px"><a href="https://www.immobiliare.it/pro/382689/pone/" target="_blank" rel="noopener nofollow" style="color:#1a62ff;text-decoration:inherit"><span style="text-decoration:underline;color:#1a62ff;white-space:pre-wrap">Immobiliare.it</span></a><br><a href="https://wa.me/393457603610" target="_blank" rel="noopener noreferrer" style="color:#1a62ff;text-decoration:inherit"><span style="text-decoration:underline;color:#1a62ff;white-space:pre-wrap">WhatsApp</span></a><br><a href="tel:+393457603610" target="_blank" rel="noopener noreferrer" style="color:#000000;text-decoration:none">+39 345 760 3610</a><br></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td height="100%" style="height:100%;font-size:0;line-height:0" aria-hidden="true">&nbsp;</td></tr></tbody></table><!--[if mso]></td>
                </tr>
              </tbody>
            </table>
          </center><![endif]--></td></tr></tbody></table></body></html>`;

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
  let html = nomeFile === "notifica" ? HTML_NOTIFICA : HTML_CONFERMA;

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
