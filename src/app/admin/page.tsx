import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORY_INFO } from "@/lib/categories";
import { approveEvent, rejectEvent } from "@/lib/actions/events";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminPage() {
  const drafts = await prisma.event.findMany({
    where: { status: "DRAFT" },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#ffeee2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 text-xl font-semibold text-slate-900">
              Entwürfe zur Freigabe
            </h1>
            <p className="text-sm text-slate-500">
              Vom täglichen Job vorgeschlagene Ereignisse. Prüfen und freigeben, bevor sie im Kalender erscheinen.
            </p>
          </div>
          <Link
            href="/admin/neu"
            className="shrink-0 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Termin anlegen
          </Link>
        </div>

        {drafts.length === 0 && (
          <p className="text-sm text-slate-500">Keine offenen Entwürfe.</p>
        )}

        <ul className="flex flex-col gap-3">
          {drafts.map((event) => (
            <li
              key={event.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{event.title}</p>
                  <p className="text-sm text-slate-500">
                    {formatDate(event.startDate)}
                    {event.endDate && ` – ${formatDate(event.endDate)}`}
                  </p>
                  <p className="mt-1 text-xs font-medium" style={{ color: CATEGORY_INFO[event.category].color }}>
                    {CATEGORY_INFO[event.category].label}
                  </p>
                  {event.description && (
                    <p className="mt-2 text-sm text-slate-600">{event.description}</p>
                  )}
                  {event.sourceUrl && (
                    <a
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                    >
                      Quelle: {event.source ?? event.sourceUrl}
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveEvent.bind(null, event.id)}>
                    <button
                      type="submit"
                      className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Freigeben
                    </button>
                  </form>
                  <form action={rejectEvent.bind(null, event.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                    >
                      Verwerfen
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
