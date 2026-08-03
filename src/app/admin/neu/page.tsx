"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createEvent, type CreateEventFormState } from "@/lib/actions/events";
import { CATEGORY_INFO, CATEGORY_ORDER } from "@/lib/categories";
import { EVENT_TYPE_INFO, EVENT_TYPE_ORDER } from "@/lib/event-types";

const initialState: CreateEventFormState = {};

export default function NewEventPage() {
  const [state, formAction, pending] = useActionState(createEvent, initialState);

  return (
    <div className="min-h-screen bg-[#ffeee2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link href="/admin" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
          ← Zurück zur Freigabe
        </Link>

        <h1 className="mb-1 text-xl font-semibold text-slate-900">Termin manuell anlegen</h1>
        <p className="mb-6 text-sm text-slate-500">
          Wird sofort veröffentlicht und erscheint direkt im Kalender.
        </p>

        <form
          action={formAction}
          className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
              Titel
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
              Notizen (optional, unbegrenzte Länge)
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Hintergrund, Details, interne Hinweise fürs Team…"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-slate-700">
                Startdatum
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-slate-700">
                Enddatum (optional)
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
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
            <div className="flex-1">
              <label htmlFor="type" className="mb-1 block text-sm font-medium text-slate-700">
                Termin-Typ
              </label>
              <select
                id="type"
                name="type"
                required
                defaultValue="EVENT"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                {EVENT_TYPE_ORDER.map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPE_INFO[type].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="location" className="mb-1 block text-sm font-medium text-slate-700">
                Ort (optional)
              </label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="z. B. Brüssel"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="institutions" className="mb-1 block text-sm font-medium text-slate-700">
                Institution(en) (optional)
              </label>
              <input
                id="institutions"
                name="institutions"
                type="text"
                placeholder="z. B. EZB, EU-Rat"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="priority" className="mb-1 block text-sm font-medium text-slate-700">
                Priorität
              </label>
              <select
                id="priority"
                name="priority"
                defaultValue="MEDIUM"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                <option value="LOW">Niedrig</option>
                <option value="MEDIUM">Mittel</option>
                <option value="HIGH">Hoch</option>
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="confirmationStatus" className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="confirmationStatus"
                name="confirmationStatus"
                defaultValue="CONFIRMED"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                <option value="CONFIRMED">Bestätigt</option>
                <option value="TENTATIVE">Vorläufig</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="source" className="mb-1 block text-sm font-medium text-slate-700">
              Quellenbezeichnung (optional)
            </label>
            <input
              id="source"
              name="source"
              type="text"
              placeholder="z. B. EU-Rat"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="rounded-md border border-[#194abb]/30 bg-[#edf1fa] p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">
              Quellennachweis <span className="text-[#194abb]">— Link oder PDF ist erforderlich</span>
            </p>

            <label htmlFor="sourceUrl" className="mb-1 block text-sm font-medium text-slate-700">
              Link zur Quelle
            </label>
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              placeholder="https://…"
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />

            <label htmlFor="sourcePdf" className="mb-1 block text-sm font-medium text-slate-700">
              oder PDF(s) hochladen (mehrere möglich)
            </label>
            <input
              id="sourcePdf"
              name="sourcePdf"
              type="file"
              accept="application/pdf"
              multiple
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-[#194abb] file:px-3 file:py-1 file:text-white"
            />
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? "Speichere…" : "Termin veröffentlichen"}
          </button>
        </form>
      </div>
    </div>
  );
}
