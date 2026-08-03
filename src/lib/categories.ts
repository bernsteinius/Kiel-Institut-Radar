import { EventCategory } from "@/generated/prisma/enums";

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
  IFW_EVENTS: { label: "Kiel Institut Events", color: "#16a34a" },
  OTHER: { label: "Sonstiges", color: "#64748b" },
};

export const CATEGORY_ORDER: EventCategory[] = [
  "MONETARY_POLICY",
  "TRADE_CHINA",
  "SECURITY_DEFENSE",
  "INSTITUTIONS",
  "FISCAL_BUDGET",
  "IFW_EVENTS",
  "OTHER",
];
