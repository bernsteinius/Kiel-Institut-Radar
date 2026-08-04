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
  FORSCHUNG: { label: "Forschung", color: "#16a34a" },
  OTHER: { label: "Sonstiges", color: "#64748b" },
};

export const PUBLICATION_COLOR = "#ffab5e";
export const ASP_COLOR = "#0d9488";

// Der IfW-Kiel-Scraper setzt "institutions" bei Advanced-Studies-Program-
// Veranstaltungen auf genau diesen Wert (aus dem "supertitle" der Quelle).
export const ASP_SUPERTITLE = "Advanced Studies Program";

// Publikationen (unabhängig von ihrer Kategorie) sollen immer in einem
// blassen Orange erscheinen, Advanced-Studies-Program-Veranstaltungen in
// einem eigenen Farbton, alle übrigen Termine in der Farbe ihrer Kategorie.
export function resolveEventColor(
  category: EventCategory,
  type: EventType,
  institutions?: string | null
): string {
  if (type === "PUBLICATION") return PUBLICATION_COLOR;
  if (category === "IFW_EVENTS" && institutions === ASP_SUPERTITLE) return ASP_COLOR;
  return CATEGORY_INFO[category].color;
}

export const CATEGORY_ORDER: EventCategory[] = [
  "MONETARY_POLICY",
  "TRADE_CHINA",
  "SECURITY_DEFENSE",
  "INSTITUTIONS",
  "FISCAL_BUDGET",
  "IFW_EVENTS",
  "FORSCHUNG",
  "OTHER",
];

// Sichtbarkeits-Gruppen für die Ein-/Ausblenden-Legende (wie einzelne
// Kalender in Outlook). "Kiel Institut" (Kategorie IFW_EVENTS) wird dabei
// in drei eigene Gruppen aufgeteilt statt einer.
export type VisibilityGroup = EventCategory | "IFW_ASP" | "PUBLICATIONS";

export function resolveVisibilityGroup(
  category: EventCategory,
  type: EventType,
  institutions?: string | null
): VisibilityGroup {
  if (type === "PUBLICATION") return "PUBLICATIONS";
  if (category === "IFW_EVENTS" && institutions === ASP_SUPERTITLE) return "IFW_ASP";
  return category;
}

export const VISIBILITY_GROUPS: Array<{ key: VisibilityGroup; label: string; color: string }> = [
  ...CATEGORY_ORDER.filter((category) => category !== "IFW_EVENTS").map((category) => ({
    key: category,
    label: CATEGORY_INFO[category].label,
    color: CATEGORY_INFO[category].color,
  })),
  { key: "IFW_EVENTS", label: "Kiel Institut Events", color: CATEGORY_INFO.IFW_EVENTS.color },
  { key: "IFW_ASP", label: "Advanced Studies Program", color: ASP_COLOR },
  { key: "PUBLICATIONS", label: "Publikationen (alle Kategorien)", color: PUBLICATION_COLOR },
];
