# Roadmap

- [ ] Complete strict blog-image access audit: anonymous listing currently exposes published filenames; download-only operation policies previously denied valid downloads. Requires a supported download/list distinction before changing RLS again. Admin live test also requires Charlotte to sign in; no matching account could be minted. No deployment.

- [x] Apply published-image snapshot RLS, remove privileged image client, verify both real covers and six private-file denials, and pass all 35 tests; no deployment. Public object listing is restricted to already-published references. Current harness build OK; production Worker output is from the previous build.

- [x] Static Pages upload isolated from server output; postbuild rejects missing HTML/assets and Pages Worker artifacts
- [x] Temporary static release: disconnect public CMS loaders and auth subscription, hide blog/CMS links and preview, retain original implementation and add static blog redirects
- [ ] Verify actual production prerender output and clean build exit (production build output unavailable in this sandbox)
- [ ] Future CMS restoration after temporary static release (requires separately hosted server and an agreed connection approach)

- [x] Blog-CMS mit geschützter Verwaltung, visuellem Editor, Medien, Kategorien, SEO, Vorschau, Zeitplanung, Änderungshistorie und verknüpften Übersetzungen umgesetzt
- [x] Echte Abläufe geprüft: Anmeldung, Erstellen, Upload, Speichern, Vorschau, Veröffentlichung, Bearbeitung, Weiterleitung, Wiederherstellung, Übersetzungen, Zukunftsplanung, Suche und Handyansicht
- [ ] Charlotte als Administratorin freischalten (wartet auf erste Anmeldung unter /auth; keine automatische Rechtevergabe an beliebige Erstnutzer)
- [ ] Abschließende Vollprüfung aller 27 Einzelpunkte des Briefings mit Charlottes Konto; E-Mail-Einladungen und Passwort-Wiederherstellung benötigen tatsächliche E-Mail-Zustellung

- [x] Explizite Sprachversionen /de, /en, /es mit bidirektionalem hreflang und Haupt-URL als x-default

- [x] Über mich modernisiert: kurze Vertrauenssignale, einmalige Erfahrungsangabe, interaktive Details und Hovereffekte in DE/EN/ES

- [x] Navigation mit sichtbarem Mouseover-Effekt prüfen
- [x] B2B-Screenshot auf den gewünschten Kennzahlen-Ausschnitt reduzieren und Beispielkästen entfernen
- [x] Sprachen-Reiter entfernen und Portrait-Hintergrund dezenter gestalten

- [x] Success-Story-Sektion mit echten Zahlen (+700 %, 8,4, +141 %, +128 %, 95 %) und drei restylten Chart-Screenshots
- [x] Feinschliff Referenzen (Zeilenumbruch, Kontrast, Anführungszeichen je Sprache)
- [x] Portrait Charlotte_BT.png an das Website-Design angepasst und in „Über mich" eingebaut
- [x] CV-Buzzwords eingebaut: Skill-Chips in „Über mich", geschärfte Leistungstexte, Sprachenzeile
- [x] Case Study: Branche „Health Care · B2B2C · anonymisiert", Traffic-Detail 350 → 2.800 ergänzt
- [ ] Offen: echte Blogtexte, Anschrift und Firmierung (aktuell Platzhalter); Kontaktmail ist visibility@better-technologies.com
- [x] Dynamische XML-Sitemap mit DE/EN/ES-Blogversionen (hreflang)
- [x] JSON-LD Schema-Markup (Interview mit Charlotte zuerst)
- [x] Kontakt-CTAs per WhatsApp mit Textvorlage
- [x] KI SEO/GEO-Optimierung im CMS (Menüpunkt „KI-Optimierung“)
- [ ] Google Drive für Bilder + Sicherungskopien (wartet auf Bestätigung der Drive-Verbindung durch Charlotte)
- [x] Hosting/Auslieferung über Cloudflare und Veröffentlichung über GitHub in der Datenschutzerklärung ergänzt (DE/EN/ES)
- [x] Cookie-Banner für Google Analytics: Einwilligung nötig, Auswahl später über „Cookie-Einstellungen“ im Fußzeilen-Menü änderbar
- [ ] Google Analytics Messkennung hinterlegen (VITE_GA_MEASUREMENT_ID), damit die Einwilligung auch wirklich Daten sammelt
