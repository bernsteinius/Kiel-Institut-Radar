import type { EventSource, RawEvent } from "./types";

/**
 * consilium.europa.eu/en/meetings/calendar/ hat eine gut strukturierte,
 * datierte Terminliste (Ratssitzungen, informelle Ministertreffen etc.) -
 * die Seite ist aber durch eine Cloudflare-JS-Challenge geschützt
 * ("cdn-cgi/challenge-platform"). Ein einfacher serverseitiger fetch()
 * bekommt HTTP 403; nur ein echter Browser mit JS-Ausführung kommt durch.
 *
 * Das würde einen Headless-Browser (z.B. Playwright) in der Vercel-Cron-
 * Funktion erfordern - für dieses Projekt unverhältnismäßig viel Infra-
 * Aufwand für eine einzelne Quelle. Diese Quelle liefert daher bewusst
 * nichts automatisch; EU-Rats-Termine müssen bis auf Weiteres manuell
 * ergänzt werden (z.B. direkt als PUBLISHED-Event in der Datenbank oder
 * über eine künftige "manuell hinzufügen"-Funktion im Admin-Bereich).
 */
export const euCouncilSource: EventSource = {
  name: "eu-rat-sitzungen",
  async fetch(): Promise<RawEvent[]> {
    return [];
  },
};
