# Rifinitura premium “cinematic luxury”

## Obiettivo
Rendere la homepage più autorevole e progettata, mantenendo palette dark/flame, Playfair Display, Inter e Space Mono. I contenuti restano invariati; cambiano ordine, gerarchia, ritmo e movimento.

## Interventi
1. **Hero più sobria**
   - Eliminare il marquee infinito.
   - Ridurre il movimento della fotografia a una deriva lentissima e quasi impercettibile, disattivata per chi preferisce meno animazioni.
   - Conservare la forza fotografica, riducendo corsivo e decorazioni ripetute.
   - Trasformare i numeri in una fascia editoriale ordinata da linee sottili, non in tre card “glass”.

2. **Immobili subito dopo l’apertura**
   - Inserire tre annunci in evidenza presi dal listino esistente, con immagine, tipologia, zona, superficie, prezzo e stato.
   - Collegare ogni annuncio al dettaglio e mantenere i richiami al listino completo e a Immobiliare.it.

3. **Nuovo ordine della homepage**
   - Hero → Immobili in evidenza → Servizi → Chi siamo/credibilità → Commerciale → Team → Partner → Contatti.
   - Aggiornare i collegamenti interni senza modificare le pagine servizio o il contenuto sostanziale.

4. **Sistema di reveal allo scroll**
   - Creare un piccolo componente basato su IntersectionObserver, senza nuove dipendenze.
   - Fade e movimento verticale ridotto, easing morbido e stagger leggero nelle griglie.
   - Nessuna animazione per `prefers-reduced-motion`; gli elementi restano leggibili anche senza JavaScript.

5. **Tipografia e dettagli**
   - Limitare il corsivo all’enfasi realmente utile.
   - Rendere coerenti soprattitoli, numerazioni `/ 01`, divider e allineamenti.
   - Ridurre raggi e trasparenze dove danno un’impressione troppo “template”, usando bordi fini e composizioni più editoriali.

## Verifica
- Controllo automatico del rendering e degli errori.
- Screenshot comparativo desktop prima/dopo e verifica mobile.
- Controllo reale dei collegamenti delle schede immobili e delle animazioni dopo lo scroll.

## Assunzioni
- Gli annunci sono gli esempi già presenti nel listino, perché non sono stati forniti nuovi immobili reali.
- Il modulo contatti resta invariato nella funzione: questa fase interviene solo sulla presentazione.
