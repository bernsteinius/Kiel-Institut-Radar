import type { EventSource, RawEvent } from "./types";
import { prisma } from "@/lib/prisma";
import { findDatesInHtml } from "@/lib/generic-date-scraper";

const MAX_DATES_PER_TOPIC = 15;

/**
 * Von Nutzern selbst hinzugefügte Suchthemen (Prisma-Modell "Topic"): Thema
 * + eine konkrete URL. Der tägliche Job liest die Seite und sucht generisch
 * nach Datumsangaben (siehe generic-date-scraper.ts). Deutlich unschärfer
 * als die dedizierten Institutions-Scraper, deshalb landen Treffer immer
 * als Entwurf - nie automatische Veröffentlichung.
 */
export const topicsSource: EventSource = {
  name: "nutzer-themen",
  async fetch(): Promise<RawEvent[]> {
    const topics = await prisma.topic.findMany();
    const events: RawEvent[] = [];

    const today = new Date();
    const todayUtc = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    for (const topic of topics) {
      try {
        const res = await fetch(topic.url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; IfWKalenderBot/1.0)" },
        });
        if (!res.ok) continue;

        const html = await res.text();
        const found = findDatesInHtml(html)
          .filter((f) => f.date >= todayUtc)
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, MAX_DATES_PER_TOPIC);

        for (const { date, snippet } of found) {
          events.push({
            title: `${topic.name}: ${snippet}`,
            startDate: date,
            allDay: true,
            category: topic.category,
            type: "EVENT",
            source: topic.name,
            sourceUrl: topic.url,
          });
        }
      } catch {
        // Einzelnes Thema darf den restlichen Ingestion-Lauf nicht abbrechen.
        continue;
      }
    }

    return events;
  },
};
