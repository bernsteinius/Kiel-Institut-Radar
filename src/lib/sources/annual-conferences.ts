import type { EventSource, RawEvent } from "./types";

/**
 * Wiederkehrende, jährliche Konferenzen mit früh offiziell angekündigten,
 * aber nicht zuverlässig scrapbaren Terminseiten (kein stabiler Feed, JS-
 * lastige Seiten). Ähnlich wie IWF/Weltbank und G7/G20 daher manuell
 * gepflegte Liste statt fragilem Scraper. Bei Bekanntwerden neuer Termine
 * hier ergänzen.
 */
const CONFERENCES: Array<{
  title: string;
  start: [number, number, number];
  end: [number, number, number];
  category: RawEvent["category"];
  type: RawEvent["type"];
  source: string;
  sourceUrl: string;
  location: string;
  institutions: string;
}> = [
  {
    title: "World Economic Forum Annual Meeting 2027 (Davos)",
    start: [2027, 1, 18],
    end: [2027, 1, 22],
    category: "INSTITUTIONS",
    type: "SUMMIT",
    source: "World Economic Forum",
    sourceUrl: "https://www.weforum.org/meetings/",
    location: "Davos, Schweiz",
    institutions: "World Economic Forum",
  },
  {
    title: "Münchner Sicherheitskonferenz 2027",
    start: [2027, 2, 12],
    end: [2027, 2, 14],
    category: "SECURITY_DEFENSE",
    type: "EVENT",
    source: "Munich Security Conference",
    sourceUrl: "https://securityconference.org/en/msc/",
    location: "München",
    institutions: "Munich Security Conference",
  },
];

export const annualConferencesSource: EventSource = {
  name: "jaehrliche-konferenzen",
  async fetch(): Promise<RawEvent[]> {
    return CONFERENCES.map((conf) => ({
      title: conf.title,
      startDate: new Date(Date.UTC(conf.start[0], conf.start[1] - 1, conf.start[2])),
      endDate: new Date(Date.UTC(conf.end[0], conf.end[1] - 1, conf.end[2])),
      allDay: true,
      category: conf.category,
      type: conf.type,
      source: conf.source,
      sourceUrl: conf.sourceUrl,
      location: conf.location,
      institutions: conf.institutions,
    }));
  },
};
