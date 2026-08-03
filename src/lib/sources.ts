import { EventCategory } from "@/generated/prisma/enums";

export interface RawEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
  category: EventCategory;
  source: string;
  sourceUrl?: string;
}

export interface EventSource {
  /** Kurzer, eindeutiger Name der Quelle, z.B. "ezb-ratssitzungen" */
  name: string;
  fetch: () => Promise<RawEvent[]>;
}

/**
 * Datenquellen für den täglichen Ingestion-Job.
 *
 * Hier werden nach Abschluss der Recherche (offizielle Kalender/Feeds der EZB,
 * FED, EU-Rat, NATO, IWF/Weltbank, G7/G20 sowie die IfW-Kiel-Veranstaltungsseite)
 * die konkreten Fetch-Funktionen ergänzt. Bis dahin ist die Liste bewusst leer,
 * damit der Cron-Job zwar lauffähig ist, aber keine erfundenen Daten einträgt.
 */
export const sources: EventSource[] = [];
