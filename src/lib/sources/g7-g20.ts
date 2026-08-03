import type { EventSource, RawEvent } from "./types";

/**
 * G7- und G20-Gipfel wechseln jährlich die Gastgeber-Präsidentschaft und
 * damit auch die Website (g7.xx, g20.org, ...) - eine stabile URL zum
 * automatischen Scrapen gibt es nicht. Diese Liste wird daher jährlich von
 * Hand gepflegt, sobald der jeweilige Gastgeber die Termine bestätigt.
 *
 * Der G7-Gipfel 2026 in Évian (15.-17. Juni 2026) liegt bereits in der
 * Vergangenheit; Termine für 2027 (G7: USA-Präsidentschaft) stehen laut
 * Recherche (Stand August 2026) noch nicht fest und fehlen daher hier.
 */
const SUMMITS: Array<{
  title: string;
  start: [number, number, number];
  end: [number, number, number];
  sourceUrl: string;
}> = [
  {
    title: "G20 Foreign Ministers' Meeting 2026 (Atlanta, USA)",
    start: [2026, 10, 30],
    end: [2026, 10, 31],
    sourceUrl: "https://g20.org/events-calendar/",
  },
  {
    title: "G20-Gipfel 2026 (Miami, USA)",
    start: [2026, 12, 14],
    end: [2026, 12, 15],
    sourceUrl: "https://g20.org/",
  },
];

export const g7g20Source: EventSource = {
  name: "g7-g20-gipfel",
  async fetch(): Promise<RawEvent[]> {
    return SUMMITS.map((summit) => ({
      title: summit.title,
      startDate: new Date(Date.UTC(summit.start[0], summit.start[1] - 1, summit.start[2])),
      endDate: new Date(Date.UTC(summit.end[0], summit.end[1] - 1, summit.end[2])),
      allDay: true,
      category: "INSTITUTIONS",
      source: "G7/G20",
      sourceUrl: summit.sourceUrl,
    }));
  },
};
