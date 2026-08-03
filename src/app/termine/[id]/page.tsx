import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_INFO, resolveEventColor } from "@/lib/categories";
import { EVENT_TYPE_INFO } from "@/lib/event-types";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Niedrig",
  MEDIUM: "Mittel",
  HIGH: "Hoch",
};

export default async function EventDetailPage({
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

  const typeInfo = EVENT_TYPE_INFO[event.type];
  const categoryInfo = CATEGORY_INFO[event.category];
  const Icon = typeInfo.icon;

  return (
    <div className="min-h-screen bg-[#ffeee2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex gap-4">
          <Link href="/" className="text-sm text-[#194abb] hover:underline">
            ← Zurück zum Kalender
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-white"
              style={{ backgroundColor: resolveEventColor(event.category, event.type) }}
            >
              {categoryInfo.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 text-slate-600">
              <Icon size={13} aria-hidden="true" />
              {typeInfo.label}
            </span>
            {event.status === "DRAFT" && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">
                Entwurf – noch nicht freigegeben
              </span>
            )}
            {event.confirmationStatus === "TENTATIVE" && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                Termin vorläufig
              </span>
            )}
          </div>

          <h1 className="mb-1 text-2xl font-semibold text-slate-900">{event.title}</h1>
          <p className="mb-6 text-sm text-slate-500">
            {formatDate(event.startDate)}
            {event.endDate && ` – ${formatDate(event.endDate)}`}
          </p>

          <dl className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {event.location && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Ort</dt>
                <dd className="text-sm text-slate-800">{event.location}</dd>
              </div>
            )}
            {event.institutions && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Institution(en)
                </dt>
                <dd className="text-sm text-slate-800">{event.institutions}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Priorität</dt>
              <dd className="text-sm text-slate-800">{PRIORITY_LABEL[event.priority]}</dd>
            </div>
          </dl>

          {event.type === "EVENT" && event.participants.length > 0 && (
            <div className="mb-6 rounded-md border border-[#194abb]/30 bg-[#edf1fa] p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#194abb]">
                Teilnehmer Kiel Institut
              </p>
              <ul className="flex flex-col gap-1 text-sm text-slate-800">
                {event.participants.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )}

          {event.description && (
            <div className="mb-6">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Notizen</p>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{event.description}</p>
            </div>
          )}

          {(event.sourceUrl || event.attachments.length > 0) && (
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Quellennachweis
              </p>
              <div className="flex flex-col gap-1">
                {event.sourceUrl && (
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#194abb] hover:underline"
                  >
                    {event.source ?? "Zur Quelle"} ↗
                  </a>
                )}
                {event.attachments.map((a) => (
                  <a
                    key={a.id}
                    href={`/api/attachments/${a.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#194abb] hover:underline"
                  >
                    PDF: {a.fileName} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          {event.status === "DRAFT" && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <Link
                href={`/admin/${event.id}/bearbeiten`}
                className="text-sm text-[#194abb] hover:underline"
              >
                Entwurf bearbeiten oder freigeben →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
