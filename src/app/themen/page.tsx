import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORY_INFO } from "@/lib/categories";
import { deleteTopic } from "@/lib/actions/topics";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const topics = await prisma.topic.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-screen bg-[#ffeee2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link href="/" className="mb-2 inline-block text-sm text-[#194abb] hover:underline">
              ← Zurück zum Kalender
            </Link>
            <h1 className="mb-1 text-xl font-semibold text-slate-900">
              Suchthemen
            </h1>
            <p className="text-sm text-slate-500">
              Jedes Thema wird täglich automatisch nach neuen Terminen durchsucht
              (die angegebene Seite wird nach Datumsangaben durchsucht). Treffer
              erscheinen als Entwurf unter{" "}
              <Link href="/admin" className="text-[#194abb] hover:underline">
                Freigabe
              </Link>
              .
            </p>
          </div>
          <Link
            href="/themen/neu"
            className="shrink-0 rounded-md bg-[#ff6a00] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e05f00]"
          >
            + Neues Thema
          </Link>
        </div>

        {topics.length === 0 && (
          <p className="text-sm text-slate-500">Noch keine Suchthemen angelegt.</p>
        )}

        <ul className="flex flex-col gap-3">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{topic.name}</p>
                <p className="text-xs font-medium" style={{ color: CATEGORY_INFO[topic.category].color }}>
                  {CATEGORY_INFO[topic.category].label}
                </p>
                <a
                  href={topic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:underline"
                >
                  {topic.url}
                </a>
              </div>
              <form action={deleteTopic.bind(null, topic.id)}>
                <button
                  type="submit"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Entfernen
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
