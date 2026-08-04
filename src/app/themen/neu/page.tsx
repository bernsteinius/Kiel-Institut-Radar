"use client";

import TopicForm from "@/components/TopicForm";
import { createTopic } from "@/lib/actions/topics";

export default function NewTopicPage() {
  return (
    <TopicForm
      action={createTopic}
      heading="Neues Suchthema"
      subheading="Der tägliche Job liest die angegebene Seite und sucht dort nach Datumsangaben. Treffer erscheinen als Entwurf zur Prüfung, nie automatisch direkt im Kalender."
      submitLabel="Thema hinzufügen"
      submitPendingLabel="Speichere…"
    />
  );
}
