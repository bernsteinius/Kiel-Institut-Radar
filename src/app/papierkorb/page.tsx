import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORY_INFO } from "@/lib/categories";
import { restoreEvent } from "@/lib/actions/events";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PapierkorbPage() {
  const trashed = await prisma.event.findMany({
    where: { status: "TRASHED" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#ffeee2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="mb-2 inline-block text-sm text-[#194abb] hover:underline">
            ← Zurück zum Kalender
          </Link>
          <h1 className="mb-1 text-xl font-semibold text-slate-900">Papierkorb</h1>
          <p className="text-sm text-slate-500">
            Gelöschte Termine landen hier und werden nie automatisch entfernt. Sie können jederzeit
            wiederhergestellt werden.
          </p>
        </div>

        {trashed.length === 0 && (
          <p className="text-sm text-slate-500">Der Papierkorb ist leer.</p>
        )}

        <ul className="flex flex-col gap-3">
          {trashed.map((event) => (
            <li
              key={event.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{event.title}</p>
                  <p className="text-sm text-slate-500">
                    {formatDate(event.startDate)}
                    {event.endDate && ` – ${formatDate(event.endDate)}`}
                  </p>
                  <p className="mt-1 text-xs font-medium" style={{ color: CATEGORY_INFO[event.category].color }}>
                    {CATEGORY_INFO[event.category].label}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  <Link
                    href={`/termine/${event.id}`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                  >
                    Ansehen
                  </Link>
                  <form action={restoreEvent.bind(null, event.id)}>
                    <button
                      type="submit"
                      className="rounded-md bg-[#194abb] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#143c96]"
                    >
                      Wiederherstellen
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
