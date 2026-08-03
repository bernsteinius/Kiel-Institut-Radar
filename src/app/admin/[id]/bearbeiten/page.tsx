import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateEvent } from "@/lib/actions/events";
import EventForm from "@/components/EventForm";

export const dynamic = "force-dynamic";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: { attachments: { select: { id: true, fileName: true } } },
  });

  if (!event) {
    notFound();
  }

  return (
    <EventForm
      action={updateEvent.bind(null, event.id)}
      defaultValues={{
        title: event.title,
        description: event.description ?? undefined,
        startDate: toDateInputValue(event.startDate),
        endDate: event.endDate ? toDateInputValue(event.endDate) : undefined,
        category: event.category,
        type: event.type,
        location: event.location ?? undefined,
        institutions: event.institutions ?? undefined,
        priority: event.priority,
        confirmationStatus: event.confirmationStatus,
        participants: event.participants.join("\n"),
        source: event.source ?? undefined,
        sourceUrl: event.sourceUrl ?? undefined,
      }}
      existingAttachments={event.attachments.map((a) => ({
        fileName: a.fileName,
        url: `/api/attachments/${a.id}`,
      }))}
      heading="Termin bearbeiten"
      subheading={
        event.status === "DRAFT"
          ? "Änderungen werden gespeichert - der Entwurf muss danach weiterhin separat freigegeben werden."
          : "Änderungen sind sofort im Kalender sichtbar."
      }
      backHref={event.status === "DRAFT" ? "/admin" : `/termine/${event.id}`}
      backLabel={event.status === "DRAFT" ? "Zurück zur Freigabe" : "Zurück zum Termin"}
      submitLabel="Änderungen speichern"
      submitPendingLabel="Speichere…"
    />
  );
}
