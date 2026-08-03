import { ecbSource } from "./ecb";
import { fomcSource } from "./fomc";
import { imfWorldBankSource } from "./imf-worldbank";
import { natoSource } from "./nato";
import { ifwEventsSource } from "./ifw-events";
import { euCouncilSource } from "./eu-council";
import { g7g20Source } from "./g7-g20";
import { annualConferencesSource } from "./annual-conferences";
import { topicsSource } from "./topics";
import { kielPublicationsSource } from "./kiel-publications";

export type { RawEvent, EventSource } from "./types";

/**
 * Datenquellen für den täglichen Ingestion-Job (siehe src/lib/ingest.ts).
 * Jede Quelle liefert Rohdaten, die als Entwurf (status: DRAFT) angelegt
 * werden - nichts wird ohne manuelle Freigabe unter /admin veröffentlicht.
 *
 * Stand der Quellen (siehe jeweilige Datei für Details/Einschränkungen):
 * - ecb, fomc: echtes HTML-Scraping stabiler Kalenderseiten
 * - imfWorldBank, g7g20: manuell gepflegte Terminlisten (keine feste URL
 *   bzw. Website blockt automatisierte Abrufe)
 * - nato: JSON-Endpunkt hinter der öffentlichen Events-Seite
 * - ifwEvents: HTML-Scraping der institutseigenen Veranstaltungsseite
 * - euCouncil: aktuell deaktiviert (Cloudflare-Bot-Schutz), liefert leer
 */
export const sources = [
  ecbSource,
  fomcSource,
  imfWorldBankSource,
  natoSource,
  ifwEventsSource,
  euCouncilSource,
  g7g20Source,
  annualConferencesSource,
  topicsSource,
  kielPublicationsSource,
];
