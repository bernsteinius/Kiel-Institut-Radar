import type { EventSource, RawEvent } from "./types";

const SEARCH_ENDPOINT =
  "https://www.nato.int/content/nato/en/news-and-events/events/event-programmes/jcr:content/root/container/general_search_copy.search.json";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format der API: "07 July 2026" */
function parseNatoDate(value: string): Date | null {
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const monthIndex = MONTHS.indexOf(monthName);
  if (monthIndex === -1) return null;
  return new Date(Date.UTC(Number(year), monthIndex, Number(day)));
}

interface NatoPage {
  title?: string;
  startDate?: string;
  endDate?: string;
  eventCity?: string;
  country?: string;
  link?: string;
}

interface NatoSearchResponse {
  pages: NatoPage[];
}

/**
 * Die öffentliche Events-Seite lädt ihre Liste per Client-seitigem Request an
 * diesen JSON-Suchendpunkt (im Browser-Netzwerk-Tab sichtbar). Liefert u.a.
 * title, startDate/endDate ("DD Month YYYY"), eventCity, country und link.
 */
export const natoSource: EventSource = {
  name: "nato-events",
  async fetch(): Promise<RawEvent[]> {
    const params = new URLSearchParams({
      searchText: "",
      searchType: "wcm",
      sortBy: "dateAsc",
      pageSize: "50",
      page: "1",
    });

    const res = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IfWKalenderBot/1.0)" },
    });
    if (!res.ok) {
      throw new Error(`NATO-Events: HTTP ${res.status}`);
    }
    const data = (await res.json()) as NatoSearchResponse;

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const events: RawEvent[] = [];
    for (const page of data.pages ?? []) {
      if (!page.title || !page.startDate) continue;

      const startDate = parseNatoDate(page.startDate);
      if (!startDate || startDate < today) continue;

      const endDate = page.endDate ? parseNatoDate(page.endDate) : null;
      const location = [page.eventCity, page.country].filter(Boolean).join(", ");

      events.push({
        title: location ? `${page.title} (${location})` : page.title,
        startDate,
        endDate:
          endDate && endDate.getTime() !== startDate.getTime() ? endDate : undefined,
        allDay: true,
        category: "SECURITY_DEFENSE",
        type: /summit/i.test(page.title) ? "SUMMIT" : "MEETING",
        source: "NATO",
        sourceUrl: page.link
          ? `https://www.nato.int${page.link.split("?")[0]}`
          : SEARCH_ENDPOINT,
        location: location || undefined,
        institutions: "NATO",
      });
    }

    return events;
  },
};
