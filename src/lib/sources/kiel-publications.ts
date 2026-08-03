import type { EventSource, RawEvent } from "./types";
import { PUBLICATION_TOPICS } from "@/lib/publication-topics";

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
  publicationType?: string;
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
    const typeMatch = block.match(/<span class="meta meta__category">([^<]+)<\/span>/);
    if (!dateMatch || !linkMatch) continue;

    teasers.push({
      title: linkMatch[2].trim(),
      link: linkMatch[1],
      publishedDate: `${dateMatch[1]}/${dateMatch[2]}`,
      publicationType: typeMatch?.[1].trim(),
    });
  }

  return teasers;
}

/**
 * Die Serien-Übersichtsseiten zeigen nur die ersten ~10 Publikationen; ein
 * "Mehr anzeigen"-Link lädt per AJAX (TYPO3 tx_ifwlistpages readmore-Action)
 * die nächste Seite als JSON nach. Der cHash ist pro Seitenzahl gültig und
 * kann nicht selbst berechnet werden - jede Antwort enthält aber bereits den
 * korrekten Link für die jeweils nächste Seite, dem wir einfach folgen.
 */
function extractReadMoreHref(html: string): string | null {
  const match = html.match(/class="readmore-button[^"]*"[^>]*href="([^"]+)"/);
  if (!match) return null;
  return match[1].replace(/&amp;/g, "&");
}

async function fetchNextPage(href: string): Promise<string | null> {
  try {
    const url = href.startsWith("http") ? href : `https://www.kielinstitut.de${href}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IfWKalenderBot/1.0)",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { markup?: string };
    return data.markup ?? null;
  } catch {
    return null;
  }
}

/**
 * Jede Publikationsseite hat unter "Mehr zum Thema" einen
 * "publication-page-topics"-Block mit den echten Themen-Schlagworten der
 * Publikation - dieselbe Taxonomie wie die "topic"-Facette der
 * Publikations-Suche (kielinstitut.de/de/suche/, gefiltert auf
 * Inhaltstyp=Publikationen). Eine Publikation kann mehreren Themen
 * zugeordnet sein.
 */
function parseTopics(html: string): string[] {
  const blockMatch = html.match(
    /<div class="publication-page-topics[^"]*">([\s\S]*?)<\/div>/
  );
  if (!blockMatch) return [];

  const topics: string[] = [];
  const regex = /<p>([^<]+)<\/p>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(blockMatch[1]))) {
    const topic = match[1].trim().replace(/&amp;/g, "&");
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

// Harte Obergrenze an Folgeseiten pro Serie, damit ein Ausbleiben des
// CUTOFF-Treffers (z.B. bei einer sehr publikationsarmen Serie) nicht zu
// unbegrenzt vielen Requests führt.
const MAX_PAGES_PER_SERIES = 15;

/**
 * Neue Publikationen des Kiel Instituts (Policy Brief, Working Paper u.a.).
 * Erscheinungsdatum ist nur monatsgenau bekannt, daher wird der 1. des
 * Monats verwendet. Es wird so lange weiterpaginiert, bis eine Publikation
 * vor CUTOFF gefunden wird (oder keine weitere Seite mehr existiert) - so
 * werden immer alle Publikationen ab CUTOFF erfasst, auch wenn mehr als
 * eine Seite nötig ist.
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

        let html = await res.text();
        let pageCount = 0;
        let reachedCutoff = false;

        while (true) {
          const teasers = parseTeasers(html);

          for (const teaser of teasers) {
            const [monthStr, yearStr] = teaser.publishedDate.split("/");
            const date = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, 1));
            if (date < CUTOFF) {
              reachedCutoff = true;
              break;
            }

            const sourceUrl = teaser.link.startsWith("http")
              ? teaser.link
              : `https://www.kielinstitut.de${teaser.link}`;
            const title = `${series.label}: ${teaser.title}`;

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
              topics: await fetchTopics(sourceUrl),
              publicationType: teaser.publicationType,
            });
          }

          if (reachedCutoff) break;

          const nextHref = extractReadMoreHref(html);
          pageCount += 1;
          if (!nextHref || pageCount >= MAX_PAGES_PER_SERIES) break;

          const nextHtml = await fetchNextPage(nextHref);
          if (!nextHtml) break;
          html = nextHtml;
        }
      } catch {
        continue;
      }
    }

    return events;
  },
};
