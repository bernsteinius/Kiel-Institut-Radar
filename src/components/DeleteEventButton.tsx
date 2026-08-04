"use client";

import { trashEvent } from "@/lib/actions/events";

export default function DeleteEventButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={trashEvent.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Termin "${title}" wirklich löschen? Er landet danach im Papierkorb.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-sm text-red-600 hover:underline"
      >
        Termin löschen
      </button>
    </form>
  );
}
