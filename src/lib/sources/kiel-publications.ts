import type { EventSource, RawEvent } from "./types";
import { PUBLICATION_TOPICS, SOURCE_TOPIC_ALIASES, detectHeuristicTopics } from "@/lib/publication-topics";

const BASE_URL = "https://www.kielinstitut.de/de/publikationen";

/**
 * Publikationsreihen des Kiel Instituts, deren Übersichtsseiten einheitlich
 * aufgebaut sind (Titel, Autor:innen, Erscheinungsmonat als "MM/YYYY").
 * "Kieler Arbeitspapiere" ist die deutsche Bezeichnung für "Working Paper".
 */
const SERIES: Array<{ slug: string; label: string }> = [
  { slug: "kiel-policy-brief", label: "Kiel Policy Brief" },
  { slug: "kieler-arbeitspapiere", label: "Kiel Working Paper" },
  { slug: "kiel-focus", label: "Kiel Focus" },
  { slug: "kiel-insight", label: "Kiel Insight" },
  { slug: "kiel-report", label: "Kiel Report" },
];

interface Teaser {
  title: string;
  link: string;
  publishedDate: string; // "MM/YYYY"
}

function parseTeasers(html: string): Teaser[] {
  const teasers: Teaser[] = [];
  const articleRegex = /<article class="publication-page-teaser"[^>]*>([\s\S]*?)<\/article>/g;

  let match: RegExpExecArray | null;
  while ((match = articleRegex.exec(html))) {
    const block = match[1];
    const dateMatch = block.match(/<span class="published-date">(\d{2})\/(\d{4})<\/span>/);
    const linkMatch = block.match(
      /<a class="publication-page-teaser__page-link" href="([^"]+)">([^<]+)<\/a>/
    );
    if (!dateMatch || !linkMatch) continue;

    teasers.push({
      title: linkMatch[2].trim(),
      link: linkMatch[1],
      publishedDate: `${dateMatch[1]}/${dateMatch[2]}`,
    });
  }

  return teasers;
}

/**
 * Jede Publikationsseite hat eine eigene "Themen"-Sektion (Kiel-Institut-
 * Taxonomie, siehe kielinstitut.de/de/themen/), unabhängig von der
 * Haupt-Navigation, die dieselben Linktexte enthält. Wir grenzen daher
 * gezielt den Abschnitt zwischen der "Themen"-Überschrift und der
 * nächsten Abschnittsüberschrift ein, bevor wir die Themen-Titel
 * herauslesen - eine Publikation kann mehreren Themen zugeordnet sein.
 */
function parseTopics(html: string): string[] {
  const themenIdx = html.indexOf("<span>Themen</span>");
  if (themenIdx === -1) return [];

  const afterThemen = html.slice(themenIdx + "<span>Themen</span>".length);
  const nextHeaderIdx = afterThemen.indexOf("element-header");
  const section = nextHeaderIdx === -1 ? afterThemen : afterThemen.slice(0, nextHeaderIdx);

  const topics: string[] = [];
  const regex = /<h3 class="basic-teaser__headline h2">([^<]+)<\/h3>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(section))) {
    const rawTopic = match[1].trim();
    const topic = SOURCE_TOPIC_ALIASES[rawTopic] ?? rawTopic;
    if (PUBLICATION_TOPICS.includes(topic) && !topics.includes(topic)) {
      topics.push(topic);
    }
  }

  return topics;
}

async function fetchTopics(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IfWKalenderBot/1.0)" },
    });
    if (!res.ok) return [];
    return parseTopics(await res.text());
  } catch {
    return [];
  }
}

// Feste untere Grenze statt "aktueller Monat", damit auch bereits im Jahr
// 2026 erschienene Publikationen erfasst werden (kein Rückwirkendes Einlesen
// der bestehenden mehreren tausend Titel aus den Vorjahren).
const CUTOFF = new Date(Date.UTC(2026, 0, 1));

/**
 * Neue Publikationen des Kiel Instituts (Policy Brief, Working Paper u.a.).
 * Erscheinungsdatum ist nur monatsgenau bekannt, daher wird der 1. des
 * Monats verwendet. Nur Publikationen ab CUTOFF werden erfasst - "neue"
 * Publikationen erscheinen, sobald sie auf der jeweiligen Reihen-Seite
 * auftauchen.
 */
export const kielPublicationsSource: EventSource = {
  name: "kiel-institut-publikationen",
  async fetch(): Promise<RawEvent[]> {
    const events: RawEvent[] = [];

    for (const series of SERIES) {
      try {
        const res = await fetch(`${BASE_URL}/${series.slug}/`, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; IfWKalenderBot/1.0)" },
        });
        if (!res.ok) continue;

        const html = await res.text();
        for (const teaser of parseTeasers(html)) {
          const [monthStr, yearStr] = teaser.publishedDate.split("/");
          const date = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, 1));
          if (date < CUTOFF) continue;

          const sourceUrl = teaser.link.startsWith("http")
            ? teaser.link
            : `https://www.kielinstitut.de${teaser.link}`;
          const title = `${series.label}: ${teaser.title}`;

          const officialTopics = await fetchTopics(sourceUrl);
          const heuristicTopics = detectHeuristicTopics(title);
          const topics = [...officialTopics, ...heuristicTopics.filter((t) => !officialTopics.includes(t))];

          events.push({
            title,
            startDate: date,
            allDay: true,
            category: "IFW_EVENTS",
            type: "PUBLICATION",
            source: "Kiel Institut",
            institutions: "Kiel Institut",
            location: "Kiel",
            sourceUrl,
            topics,
          });
        }
      } catch {
        continue;
      }
    }

    return events;
  },
};
