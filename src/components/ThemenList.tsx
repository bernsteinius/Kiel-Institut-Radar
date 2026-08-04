"use client";

import { useMemo, useState } from "react";
import { CATEGORY_INFO } from "@/lib/categories";
import { deleteTopic } from "@/lib/actions/topics";
import type { BuiltInTopic } from "@/lib/built-in-topics";
import type { EventCategory } from "@/generated/prisma/enums";

interface DbTopic {
  id: string;
  name: string;
  url: string;
  category: EventCategory;
}

export default function ThemenList({
  builtIn,
  topics,
}: {
  builtIn: BuiltInTopic[];
  topics: DbTopic[];
}) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredBuiltIn = useMemo(
    () =>
      builtIn.filter(
        (t) =>
          !normalizedQuery ||
          t.name.toLowerCase().includes(normalizedQuery) ||
          CATEGORY_INFO[t.category].label.toLowerCase().includes(normalizedQuery)
      ),
    [builtIn, normalizedQuery]
  );

  const filteredTopics = useMemo(
    () =>
      topics.filter(
        (t) =>
          !normalizedQuery ||
          t.name.toLowerCase().includes(normalizedQuery) ||
          CATEGORY_INFO[t.category].label.toLowerCase().includes(normalizedQuery)
      ),
    [topics, normalizedQuery]
  );

  return (
    <div>
      <div className="mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchthemen durchsuchen…"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Eigene Suchthemen ({filteredTopics.length})
        </h2>
        {filteredTopics.length === 0 && (
          <p className="text-sm text-slate-500">
            {topics.length === 0 ? "Noch keine eigenen Suchthemen angelegt." : "Keine Treffer."}
          </p>
        )}
        <ul className="flex flex-col gap-3">
          {filteredTopics.map((topic) => (
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

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Automatische Quellen ({filteredBuiltIn.length})
        </h2>
        {filteredBuiltIn.length === 0 && (
          <p className="text-sm text-slate-500">Keine Treffer.</p>
        )}
        <ul className="flex flex-col gap-3">
          {filteredBuiltIn.map((topic) => (
            <li
              key={topic.name}
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
              <span className="shrink-0 rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-500">
                fest eingerichtet
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
