import type { EventSource, RawEvent } from "./types";

// Achtung: ifw-kiel.de leitet (Stand 2026) per 301/307 auf kielinstitut.de um.
const EVENTS_URL = "https://www.kielinstitut.de/de/veranstaltungen/";

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, "Mär": 2, Mrz: 2, Apr: 3, Mai: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Okt: 9, Nov: 10, Dez: 11,
};

/**
 * Jede Veranstaltung ist ein <article class="event-teaser">-Block mit
 * Tag/Monat/Jahr in separaten <span>/<p>-Elementen. Wir schneiden vorher den
 * Abschnitt "Alle zukünftigen Veranstaltungen" heraus, damit der
 * "Rückblick"-Abschnitt (vergangene Events) nicht mit erfasst wird.
 *
 * Hinweis: Die Liste ist paginiert - hier wird nur die erste Seite
 * (nächstliegende Termine) gelesen, was für den täglichen Job ausreicht.
 */
function parseIfwEvents(html: string): RawEvent[] {
  const startMarker = html.indexOf("Alle zukünftigen Veranstaltungen");
  const endMarker = html.indexOf("Rückblick auf Veranstaltungen");
  if (startMarker === -1) return [];

  const section = html.slice(startMarker, endMarker === -1 ? undefined : endMarker);

  const events: RawEvent[] = [];
  const articleRegex = /<article class="event-teaser[^"]*"[^>]*>([\s\S]*?)<\/article>/g;

  let articleMatch: RegExpExecArray | null;
  while ((articleMatch = articleRegex.exec(section))) {
    const block = articleMatch[1];

    // Mehrtägige Veranstaltungen (z.B. Kurse) zeigen den Tag als Spanne,
    // z.B. "03&thinsp;–&thinsp;09" statt einer einzelnen Zahl.
    const dayMatch = block.match(/<span class="day">([^<]+)<\/span>/);
    const monthMatch = block.match(/<span class="month">([^<]+)<\/span>/);
    const yearMatch = block.match(/<p class="year">(\d{4})<\/p>/);
    const titleMatch = block.match(/<h3 class="event-teaser__headline[^"]*">([^<]+)<\/h3>/);
    const linkMatch = block.match(/<a href="([^"]+)" class="event-teaser__blocklink">/);
    // Die Seite selbst ordnet jede Veranstaltung einer Reihe/einem Programm
    // zu (z.B. "Advanced Studies Program", "Kiel Research Seminar") - das
    // nutzen wir als "institutions", u.a. um ASP-Termine im Kalender separat
    // ein-/ausblendbar zu machen.
    const supertitleMatch = block.match(/<p class="event-teaser__supertitle">([^<]+)<\/p>/);

    if (!dayMatch || !monthMatch || !yearMatch || !titleMatch) continue;
    const monthIndex = MONTHS[monthMatch[1].trim()];
    if (monthIndex === undefined) continue;

    const days = dayMatch[1].match(/\d{1,2}/g);
    if (!days) continue;
    const year = Number(yearMatch[1]);
    const startDate = new Date(Date.UTC(year, monthIndex, Number(days[0])));
    const endDate = days[1] ? new Date(Date.UTC(year, monthIndex, Number(days[1]))) : undefined;

    events.push({
      title: titleMatch[1].trim(),
      startDate,
      endDate,
      allDay: true,
      category: "IFW_EVENTS",
      type: "EVENT",
      source: "IfW Kiel",
      sourceUrl: linkMatch
        ? `https://www.kielinstitut.de${linkMatch[1]}`
        : EVENTS_URL,
      location: "Kiel Institut für Weltwirtschaft",
      institutions: supertitleMatch ? supertitleMatch[1].trim() : "Kiel Institut",
    });
  }

  return events;
}

export const ifwEventsSource: EventSource = {
  name: "ifw-kiel-veranstaltungen",
  async fetch() {
    const res = await fetch(EVENTS_URL);
    if (!res.ok) {
      throw new Error(`IfW-Kiel-Veranstaltungen: HTTP ${res.status}`);
    }
    return parseIfwEvents(await res.text());
  },
};
