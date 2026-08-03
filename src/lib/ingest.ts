import "server-only";
import { prisma } from "@/lib/prisma";
import { sources, type RawEvent } from "@/lib/sources";

interface IngestSummary {
  source: string;
  found: number;
  created: number;
  skippedDuplicates: number;
  error?: string;
}

async function isDuplicate(raw: RawEvent): Promise<boolean> {
  const existing = await prisma.event.findFirst({
    where: raw.sourceUrl
      ? { sourceUrl: raw.sourceUrl, startDate: raw.startDate }
      : { title: raw.title, startDate: raw.startDate },
    select: { id: true },
  });
  return existing !== null;
}

/**
 * Holt Ereignisse aus allen konfigurierten Quellen und legt neue als
 * DRAFT-Einträge an (kein Auto-Publish, siehe Admin-Review-Seite unter /admin).
 */
export async function ingestAll(): Promise<IngestSummary[]> {
  const summaries: IngestSummary[] = [];

  for (const source of sources) {
    let found = 0;
    let created = 0;
    let skippedDuplicates = 0;

    try {
      const rawEvents = await source.fetch();
      found = rawEvents.length;

      for (const raw of rawEvents) {
        if (await isDuplicate(raw)) {
          skippedDuplicates += 1;
          continue;
        }

        await prisma.event.create({
          data: {
            title: raw.title,
            description: raw.description,
            startDate: raw.startDate,
            endDate: raw.endDate,
            allDay: raw.allDay ?? true,
            category: raw.category,
            status: "DRAFT",
            source: raw.source,
            sourceUrl: raw.sourceUrl,
          },
        });
        created += 1;
      }

      summaries.push({ source: source.name, found, created, skippedDuplicates });
    } catch (error) {
      summaries.push({
        source: source.name,
        found,
        created,
        skippedDuplicates,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return summaries;
}
