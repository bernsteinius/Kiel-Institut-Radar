import type { EventSource, RawEvent } from "./types";

const CALENDAR_URL =
  "https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html";

/**
 * Die Seite listet Termine als einfache <dt>Datum</dt><dd>Beschreibung</dd>-Paare
 * im Format DD/MM/YYYY, z.B.:
 *   <dt>09/09/2026</dt>
 *   <dd>Governing Council of the ECB: monetary policy meeting ...<br></dd>
 */
function parseEcbCalendar(html: string): RawEvent[] {
  const events: RawEvent[] = [];
  const regex =
    /<dt>\s*(\d{2})\/(\d{2})\/(\d{4})\s*<\/dt>\s*<dd>\s*([\s\S]*?)<br>/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    const [, day, month, year, rawTitle] = match;
    const title = rawTitle.replace(/\s+/g, " ").trim();
    if (!title) continue;

    events.push({
      title,
      startDate: new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))),
      allDay: true,
      category: "MONETARY_POLICY",
      type: "MEETING",
      source: "EZB",
      sourceUrl: CALENDAR_URL,
      location: "Frankfurt am Main",
      institutions: "EZB",
    });
  }

  return events;
}

export const ecbSource: EventSource = {
  name: "ezb-ratssitzungen",
  async fetch() {
    const res = await fetch(CALENDAR_URL);
    if (!res.ok) {
      throw new Error(`EZB-Kalender: HTTP ${res.status}`);
    }
    return parseEcbCalendar(await res.text());
  },
};
