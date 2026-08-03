"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createTopic, type CreateTopicFormState } from "@/lib/actions/topics";
import { CATEGORY_INFO, CATEGORY_ORDER } from "@/lib/categories";

const initialState: CreateTopicFormState = {};

export default function NewTopicPage() {
  const [state, formAction, pending] = useActionState(createTopic, initialState);

  return (
    <div className="min-h-screen bg-[#ffeee2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex gap-4">
          <Link href="/themen" className="text-sm text-[#194abb] hover:underline">
            ← Zurück zu den Suchthemen
          </Link>
          <Link href="/" className="text-sm text-[#194abb] hover:underline">
            ← Zurück zum Kalender
          </Link>
        </div>

        <h1 className="mb-1 text-xl font-semibold text-slate-900">Neues Suchthema</h1>
        <p className="mb-6 text-sm text-slate-500">
          Der tägliche Job liest die angegebene Seite und sucht dort nach
          Datumsangaben. Treffer erscheinen als Entwurf zur Prüfung, nie
          automatisch direkt im Kalender.
        </p>

        <form
          action={formAction}
          className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Thema
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="z. B. Davos / World Economic Forum"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="url" className="mb-1 block text-sm font-medium text-slate-700">
              URL der Terminseite
            </label>
            <input
              id="url"
              name="url"
              type="url"
              required
              placeholder="https://…"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
              Kategorie
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue=""
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="" disabled>
                Bitte wählen…
              </option>
              {CATEGORY_ORDER.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_INFO[category].label}
                </option>
              ))}
            </select>
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-[#194abb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#143c96] disabled:opacity-50"
          >
            {pending ? "Speichere…" : "Thema hinzufügen"}
          </button>
        </form>
      </div>
    </div>
  );
}
