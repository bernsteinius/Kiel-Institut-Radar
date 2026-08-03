import { Users, Globe, Gavel, Mic2, FileText, AlarmClock, type LucideIcon } from "lucide-react";
import { EventType } from "@/generated/prisma/enums";

interface EventTypeInfo {
  label: string;
  icon: LucideIcon;
}

export const EVENT_TYPE_INFO: Record<EventType, EventTypeInfo> = {
  MEETING: { label: "Sitzung/Meeting", icon: Users },
  SUMMIT: { label: "Gipfel", icon: Globe },
  DECISION: { label: "Entscheidung/Beschluss", icon: Gavel },
  EVENT: { label: "Veranstaltung", icon: Mic2 },
  PUBLICATION: { label: "Publikation/Paper", icon: FileText },
  DEADLINE: { label: "Frist", icon: AlarmClock },
};

export const EVENT_TYPE_ORDER: EventType[] = [
  "MEETING",
  "SUMMIT",
  "DECISION",
  "EVENT",
  "PUBLICATION",
  "DEADLINE",
];
