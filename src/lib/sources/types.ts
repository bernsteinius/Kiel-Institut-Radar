import { EventCategory, EventType } from "@/generated/prisma/enums";

export interface RawEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
  category: EventCategory;
  type: EventType;
  source: string;
  sourceUrl?: string;
  location?: string;
  /** Land, wenn von der Quelle direkt bekannt (sonst wird es aus location hergeleitet) */
  country?: string;
  /** Freitext-Uhrzeit am Ort, z.B. "14:00 Ortszeit" (startDate bleibt reines Datum) */
  locationTime?: string;
  institutions?: string;
  /** Kiel-Institut-Themen, nur bei Publikationen relevant */
  topics?: string[];
}

export interface EventSource {
  /** Kurzer, eindeutiger Name der Quelle, z.B. "ezb-ratssitzungen" */
  name: string;
  fetch: () => Promise<RawEvent[]>;
}
