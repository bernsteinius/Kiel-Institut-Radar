// Offizielle Themen-Taxonomie des Kiel Instituts (kielinstitut.de/de/themen/).
// Jede Publikation kann von dort mit einem oder mehreren dieser Themen
// verknüpft sein (siehe "Themen"-Sektion auf der jeweiligen Publikationsseite).
const OFFICIAL_TOPICS: string[] = [
  "Russland/Ukraine",
  "Industriepolitik",
  "Internationaler Handel",
  "Afrika",
  "China",
  "Klima und Energie",
  "Konjunktur",
  "Wirtschaftspolitik in Deutschland",
];

// Die Original-Themenbezeichnung von kielinstitut.de weicht von unserer
// eigenen Beschriftung ab - beim Scrapen wird der Original-Text hierüber auf
// unseren kanonischen Namen abgebildet.
export const SOURCE_TOPIC_ALIASES: Record<string, string> = {
  "Krieg gegen die Ukraine": "Russland/Ukraine",
};

// Zusätzliche, von uns definierte Themen ohne eigene Themenseite auf
// kielinstitut.de - werden heuristisch anhand des Titels erkannt (siehe
// detectHeuristicTopics) und stehen zusätzlich zur manuellen Auswahl im
// Formular zur Verfügung.
const CUSTOM_TOPICS: string[] = ["Verteidigung", "Zollpolitik", "USA"];

export const PUBLICATION_TOPICS: string[] = [...OFFICIAL_TOPICS, ...CUSTOM_TOPICS];

const HEURISTIC_PATTERNS: Array<{ topic: string; pattern: RegExp }> = [
  { topic: "Verteidigung", pattern: /verteidigung|defence|defense|rearmament|bundeswehr/i },
  { topic: "Zollpolitik", pattern: /zoll|tariff/i },
  { topic: "USA", pattern: /\busa\b|united states|\bamerika/i },
];

/**
 * Erkennt die CUSTOM_TOPICS anhand von Schlagwörtern im Titel, da diese
 * (anders als OFFICIAL_TOPICS) nicht aus einer "Themen"-Sektion auf
 * kielinstitut.de gelesen werden können.
 */
export function detectHeuristicTopics(title: string): string[] {
  return HEURISTIC_PATTERNS.filter(({ pattern }) => pattern.test(title)).map(({ topic }) => topic);
}
