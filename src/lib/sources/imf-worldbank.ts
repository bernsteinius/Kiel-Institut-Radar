import type { EventSource, RawEvent } from "./types";

/**
 * IWF/Weltbank halten nur zwei Tagungen pro Jahr ab (Spring Meetings im
 * April, Annual Meetings im Oktober), die Jahre im Voraus offiziell
 * angekündigt werden. Die Ankündigungsseiten (imf.org, worldbank.org)
 * blocken automatisierte Abrufe (HTTP 403), daher wird diese Liste manuell
 * gepflegt statt gescraped. Quelle jeweils bei Bekanntwerden neuer Termine
 * ergänzen: https://www.worldbank.org/en/meetings/splash/about
 */
const MEETINGS: Array<{
  title: string;
  start: [number, number, number];
  end: [number, number, number];
  sourceUrl: string;
}> = [
  {
    title: "IWF/Weltbank Annual Meetings 2026 (Bangkok, Thailand)",
    start: [2026, 10, 12],
    end: [2026, 10, 18],
    sourceUrl: "https://www.worldbank.org/en/meetings/splash/annual",
  },
  {
    title: "IWF/Weltbank Spring Meetings 2027 (Washington, D.C.)",
    start: [2027, 4, 12],
    end: [2027, 4, 17],
    sourceUrl: "https://www.worldbank.org/en/meetings/splash/spring",
  },
  {
    title: "IWF/Weltbank Annual Meetings 2027 (Washington, D.C.)",
    start: [2027, 10, 4],
    end: [2027, 10, 9],
    sourceUrl: "https://www.worldbank.org/en/meetings/splash/annual",
  },
];

export const imfWorldBankSource: EventSource = {
  name: "iwf-weltbank-tagungen",
  async fetch(): Promise<RawEvent[]> {
    return MEETINGS.map((meeting) => ({
      title: meeting.title,
      startDate: new Date(Date.UTC(meeting.start[0], meeting.start[1] - 1, meeting.start[2])),
      endDate: new Date(Date.UTC(meeting.end[0], meeting.end[1] - 1, meeting.end[2])),
      allDay: true,
      category: "INSTITUTIONS",
      source: "IWF/Weltbank",
      sourceUrl: meeting.sourceUrl,
    }));
  },
};
