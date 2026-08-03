import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORY_INFO, resolveEventColor } from "@/lib/categories";
import { EVENT_TYPE_INFO } from "@/lib/event-types";

export const dynamic = "force-dynamic";

// Ganztägige Termine werden als reine "YYYY-MM-DD"-Strings ausgegeben statt
// als volle ISO-Zeitstempel, damit der Browser sie nicht in seine eigene
// Zeitzone umrechnet und dabei auf den Vor- oder Folgetag verschiebt.
function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// FullCalendar behandelt "end" bei ganztägigen Terminen als exklusiv (den
// Tag nach dem letzten Tag) - unser gespeichertes endDate ist der letzte
// Tag selbst, daher hier +1 Tag.
function toExclusiveEndDateOnly(date: Date): string {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + 1);
  return toDateOnly(next);
}

export async function GET() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startDate: "asc" },
    include: { attachments: { select: { id: true, fileName: true } } },
  });

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.allDay ? toDateOnly(event.startDate) : event.startDate,
    end: event.endDate
      ? event.allDay
        ? toExclusiveEndDateOnly(event.endDate)
        : event.endDate
      : undefined,
    allDay: event.allDay,
    color: resolveEventColor(event.category, event.type),
    extendedProps: {
      description: event.description,
      category: event.category,
      categoryLabel: CATEGORY_INFO[event.category].label,
      type: event.type,
      typeLabel: EVENT_TYPE_INFO[event.type].label,
      source: event.source,
      sourceUrl: event.sourceUrl,
      location: event.location,
      institutions: event.institutions,
      priority: event.priority,
      confirmationStatus: event.confirmationStatus,
      participants: event.participants,
      attachments: event.attachments.map((a) => ({
        id: a.id,
        fileName: a.fileName,
        url: `/api/attachments/${a.id}`,
      })),
    },
  }));

  return NextResponse.json(calendarEvents);
}
