# IfW Kiel Ereigniskalender

Web-Kalender für eine geschlossene Nutzergruppe: wirtschaftspolitische Termine
(EU, NATO, FED, IWF/Weltbank, G7 u.a.) sowie eigene IfW-Kiel-Veranstaltungen,
farblich nach Kategorie sortiert. Zugriff über ein gemeinsames Passwort.
Ein täglicher Job schlägt neue Ereignisse als Entwurf vor; sie erscheinen erst
nach Freigabe unter `/admin` im öffentlichen Kalender.

## Stack

- Next.js 16 (App Router) auf Vercel
- Postgres bei [Neon](https://neon.tech) über Prisma 7
- Session-Cookie (iron-session) für den Passwortschutz
- Vercel Cron für den täglichen Ingestion-Job

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Ohne gültige `DATABASE_URL` in `.env` funktionieren nur `/login` und die
Proxy-Umleitung; alle Seiten, die die Datenbank abfragen (`/`, `/admin`,
`/api/events`), brauchen eine echte Verbindung.

## Deployment

### 1. GitHub-Repo anlegen

```bash
git remote add origin <URL deines neuen GitHub-Repos>
git push -u origin main
```

(Falls noch kein Repo existiert: auf github.com ein neues, leeres Repository anlegen — ohne README/without initial commit — und die angezeigte `origin`-URL verwenden.)

### 2. Neon-Datenbank anlegen

1. Auf [neon.tech](https://neon.tech) kostenlos registrieren.
2. Neues Projekt/Datenbank anlegen.
3. Im Dashboard die **Direct connection string** kopieren (→ `DATABASE_URL`).
   Der Prisma-Neon-Adapter verwaltet das Connection-Pooling selbst, daher
   reicht eine einzige URL.

### 3. Bei Vercel importieren

1. Auf [vercel.com](https://vercel.com) mit dem GitHub-Account anmelden.
2. "Add New… → Project" → das gerade gepushte Repo auswählen → Import.
3. Unter "Environment Variables" eintragen (siehe `.env.example`):
   - `DATABASE_URL` (aus Neon)
   - `SITE_PASSWORD` (das Passwort, das die Nutzergruppe bekommt)
   - `SESSION_SECRET` (`openssl rand -base64 32`)
   - `CRON_SECRET` (`openssl rand -hex 16`)
4. Deploy.

### 4. Datenbankschema anlegen

Einmalig, mit den echten Neon-Zugangsdaten in `.env` lokal:

```bash
npx prisma migrate dev --name init
```

Das legt die Tabellen in der Neon-Datenbank an. Bei künftigen Schema-Änderungen
erneut `prisma migrate dev` (lokal) bzw. `prisma migrate deploy` verwenden.

## Nutzung

- **`/`** — Kalender (nach Login sichtbar)
- **`/admin`** — Entwürfe aus dem täglichen Job freigeben oder verwerfen
- **`/api/events`** — JSON-Feed der veröffentlichten Ereignisse (für den Kalender)
- **`/api/cron/daily`** — täglicher Ingestion-Job, per `vercel.json` auf 05:00 UTC geplant,
  nur mit `Authorization: Bearer <CRON_SECRET>` aufrufbar

## Datenquellen (`src/lib/sources.ts`)

Die Liste der automatischen Quellen ist aktuell leer — sie wird nach der
Recherche zu offiziellen Kalendern (EZB, FED, EU-Rat, NATO, IWF/Weltbank,
G7/G20, IfW-Kiel-Veranstaltungsseite) befüllt. Jede Quelle ist eine Funktion,
die Rohdaten liefert; `src/lib/ingest.ts` dedupliziert gegen bestehende
Einträge und legt neue als Entwurf (`status: DRAFT`) an.

## Kategorien & Farben (`src/lib/categories.ts`)

- Geldpolitik (FED/EZB)
- Handel & EU-China
- Sicherheit & Verteidigung
- Institutionen (G7/G20/IWF/Weltbank/NATO)
- Haushalt & Fiskalpolitik
- IfW-Kiel-Veranstaltungen
- Sonstiges
