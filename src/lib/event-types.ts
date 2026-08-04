import { Users, Globe, Gavel, Mic2, FileText, AlarmClock, type LucideIcon } from "lucide-react";
import { EventType } from "@/generated/prisma/enums";

interface EventTypeInfo {
  label: string;
  icon: LucideIcon;
  color: string;
}

export const EVENT_TYPE_INFO: Record<EventType, EventTypeInfo> = {
  MEETING: { label: "Sitzung/Meeting", icon: Users, color: "#475569" },
  SUMMIT: { label: "Gipfel", icon: Globe, color: "#6d28d9" },
  DECISION: { label: "Entscheidung/Beschluss", icon: Gavel, color: "#be123c" },
  EVENT: { label: "Veranstaltung", icon: Mic2, color: "#0e7490" },
  PUBLICATION: { label: "Publikation/Paper", icon: FileText, color: "#c2670c" },
  DEADLINE: { label: "Frist", icon: AlarmClock, color: "#a16207" },
};

export const EVENT_TYPE_ORDER: EventType[] = [
  "MEETING",
  "SUMMIT",
  "DECISION",
  "EVENT",
  "PUBLICATION",
  "DEADLINE",
];
