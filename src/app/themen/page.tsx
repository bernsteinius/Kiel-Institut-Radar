import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BUILT_IN_TOPICS } from "@/lib/built-in-topics";
import ThemenList from "@/components/ThemenList";

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
              Jedes Thema wird täglich automatisch nach neuen Terminen durchsucht.
              Treffer erscheinen als Entwurf unter{" "}
              <Link href="/admin" className="text-[#194abb] hover:underline">
                Freigabe
              </Link>
              . Automatische Quellen sind fest im Code eingerichtet und nicht
              über diese Seite entfernbar.
            </p>
          </div>
          <Link
            href="/themen/neu"
            className="shrink-0 rounded-md bg-[#ff6a00] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e05f00]"
          >
            + Neues Thema
          </Link>
        </div>

        <ThemenList builtIn={BUILT_IN_TOPICS} topics={topics} />
      </div>
    </div>
  );
}
