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
  institutions?: string;
}

export interface EventSource {
  /** Kurzer, eindeutiger Name der Quelle, z.B. "ezb-ratssitzungen" */
  name: string;
  fetch: () => Promise<RawEvent[]>;
}
