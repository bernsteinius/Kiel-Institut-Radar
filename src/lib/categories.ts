import { EventCategory, EventType } from "@/generated/prisma/enums";

interface CategoryInfo {
  label: string;
  color: string;
}

export const CATEGORY_INFO: Record<EventCategory, CategoryInfo> = {
  MONETARY_POLICY: { label: "Geldpolitik (FED/EZB)", color: "#2563eb" },
  TRADE_CHINA: { label: "Handel & EU-China", color: "#dc2626" },
  SECURITY_DEFENSE: { label: "Sicherheit & Verteidigung", color: "#7c3aed" },
  INSTITUTIONS: { label: "Institutionen (G7/G20/IWF/Weltbank/NATO)", color: "#0891b2" },
  FISCAL_BUDGET: { label: "Haushalt & Fiskalpolitik", color: "#d97706" },
  IFW_EVENTS: { label: "Kiel Institut Events", color: "#6a9bd8" },
  OTHER: { label: "Sonstiges", color: "#64748b" },
};

export const PUBLICATION_COLOR = "#ffab5e";

// Publikationen (unabhängig von ihrer Kategorie) sollen immer in einem
// blassen Orange erscheinen, alle übrigen Termine in der Farbe ihrer Kategorie.
export function resolveEventColor(category: EventCategory, type: EventType): string {
  if (type === "PUBLICATION") return PUBLICATION_COLOR;
  return CATEGORY_INFO[category].color;
}

export const CATEGORY_ORDER: EventCategory[] = [
  "MONETARY_POLICY",
  "TRADE_CHINA",
  "SECURITY_DEFENSE",
  "INSTITUTIONS",
  "FISCAL_BUDGET",
  "IFW_EVENTS",
  "OTHER",
];
