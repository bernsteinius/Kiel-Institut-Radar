"use client";

import EventForm from "@/components/EventForm";
import { createEvent } from "@/lib/actions/events";

export default function NewEventPage() {
  return (
    <EventForm
      action={createEvent}
      heading="Termin manuell anlegen"
      subheading="Wird sofort veröffentlicht und erscheint direkt im Kalender."
      backHref="/admin"
      backLabel="Zurück zur Freigabe"
      submitLabel="Termin veröffentlichen"
      submitPendingLabel="Speichere…"
    />
  );
}
