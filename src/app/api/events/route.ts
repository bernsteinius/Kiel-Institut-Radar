import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORY_INFO } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startDate: "asc" },
  });

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startDate,
    end: event.endDate ?? undefined,
    allDay: event.allDay,
    color: CATEGORY_INFO[event.category].color,
    extendedProps: {
      description: event.description,
      category: event.category,
      categoryLabel: CATEGORY_INFO[event.category].label,
      source: event.source,
      sourceUrl: event.sourceUrl,
    },
  }));

  return NextResponse.json(calendarEvents);
}
