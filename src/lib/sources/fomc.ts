import type { EventSource, RawEvent } from "./types";

const CALENDAR_URL =
  "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Die Seite gliedert sich in Jahres-Panels ("<h4>...>2026 FOMC Meetings</a></h4>"),
 * darunter je Sitzung ein Block mit Monat ("<strong>January</strong>") und
 * Tagesspanne ("27-28", "17-18*", auch "22 (notation vote)" oder "30-1" bei
 * Monatswechsel). Wir verwenden jeweils den ersten Tag der Spanne als Startdatum.
 */
function parseFomcCalendar(html: string): RawEvent[] {
  const yearHeaders: { index: number; year: number }[] = [];
  const yearRegex = /<h4><a id="[^"]*">(\d{4}) FOMC Meetings<\/a><\/h4>/g;
  let yearMatch: RegExpExecArray | null;
  while ((yearMatch = yearRegex.exec(html))) {
    yearHeaders.push({ index: yearMatch.index, year: Number(yearMatch[1]) });
  }

  function yearAt(index: number): number | null {
    let year: number | null = null;
    for (const header of yearHeaders) {
      if (header.index <= index) year = header.year;
      else break;
    }
    return year;
  }

  const meetingRegex =
    /fomc-meeting__month[^"]*"><strong>([A-Za-z]+)<\/strong><\/div>\s*<div class="fomc-meeting__date[^"]*">([^<]+)<\/div>/g;

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const events: RawEvent[] = [];
  let match: RegExpExecArray | null;
  while ((match = meetingRegex.exec(html))) {
    const [, monthName, rawDate] = match;
    const year = yearAt(match.index);
    const monthIndex = MONTHS.indexOf(monthName);
    if (year === null || monthIndex === -1) continue;

    const dayMatch = rawDate.match(/\d{1,2}/);
    if (!dayMatch) continue;

    const startDate = new Date(Date.UTC(year, monthIndex, Number(dayMatch[0])));
    if (startDate < today) continue;

    events.push({
      title: `FOMC-Sitzung (${monthName} ${year})`,
      startDate,
      allDay: true,
      category: "MONETARY_POLICY",
      type: "DECISION",
      source: "FED/FOMC",
      sourceUrl: CALENDAR_URL,
      location: "Washington, D.C.",
      institutions: "Federal Reserve (FOMC)",
    });
  }

  return events;
}

export const fomcSource: EventSource = {
  name: "fomc-sitzungen",
  async fetch() {
    const res = await fetch(CALENDAR_URL);
    if (!res.ok) {
      throw new Error(`FOMC-Kalender: HTTP ${res.status}`);
    }
    return parseFomcCalendar(await res.text());
  },
};
