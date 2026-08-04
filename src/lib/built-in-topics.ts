import type { EventCategory } from "@/generated/prisma/enums";

export interface BuiltInTopic {
  name: string;
  category: EventCategory;
  url: string;
}

/**
 * Fest im Code eingerichtete Quellen (dedizierte Scraper statt generischer
 * Datums-Suche, siehe src/lib/sources/) - werden hier nur zur Übersicht mit
 * angezeigt, sind aber nicht über die Oberfläche löschbar/bearbeitbar.
 */
export const BUILT_IN_TOPICS: BuiltInTopic[] = [
  {
    name: "EZB-Ratssitzungen (EZB-Kalender)",
    category: "MONETARY_POLICY",
    url: "https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html",
  },
  {
    name: "FOMC-Sitzungen (Fed-Kalender)",
    category: "MONETARY_POLICY",
    url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
  },
  {
    name: "IWF/Weltbank-Tagungen",
    category: "INSTITUTIONS",
    url: "https://www.worldbank.org/en/meetings/splash/about",
  },
  {
    name: "NATO-Veranstaltungen",
    category: "SECURITY_DEFENSE",
    url: "https://www.nato.int/en/news-and-events/events",
  },
  {
    name: "IfW-Kiel-Veranstaltungen",
    category: "IFW_EVENTS",
    url: "https://www.kielinstitut.de/de/veranstaltungen/",
  },
  {
    name: "G7/G20-Gipfel",
    category: "INSTITUTIONS",
    url: "https://g20.org/",
  },
  {
    name: "World Economic Forum (Davos)",
    category: "INSTITUTIONS",
    url: "https://www.weforum.org/meetings/",
  },
  {
    name: "Münchner Sicherheitskonferenz",
    category: "SECURITY_DEFENSE",
    url: "https://securityconference.org/en/msc/",
  },
  {
    name: "Kiel Institut Publikationen",
    category: "IFW_EVENTS",
    url: "https://www.kielinstitut.de/de/publikationen/",
  },
];
