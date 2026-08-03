"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { CreateEventFormState } from "@/lib/actions/events";
import { CATEGORY_INFO, CATEGORY_ORDER } from "@/lib/categories";
import { EVENT_TYPE_INFO, EVENT_TYPE_ORDER } from "@/lib/event-types";
import type { EventType } from "@/generated/prisma/enums";

export interface EventFormDefaults {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: EventType;
  location?: string;
  institutions?: string;
  priority?: string;
  confirmationStatus?: string;
  participants?: string;
  source?: string;
  sourceUrl?: string;
}

interface EventFormProps {
  action: (state: CreateEventFormState, formData: FormData) => Promise<CreateEventFormState>;
  defaultValues?: EventFormDefaults;
  existingAttachments?: Array<{ fileName: string; url: string }>;
  heading: string;
  subheading: string;
  backHref: string;
  backLabel: string;
  submitLabel: string;
  submitPendingLabel: string;
}

const initialState: CreateEventFormState = {};

export default function EventForm({
  action,
  defaultValues,
  existingAttachments = [],
  heading,
  subheading,
  backHref,
  backLabel,
  submitLabel,
  submitPendingLabel,
}: EventFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState<EventType>(defaultValues?.type ?? "EVENT");

  return (
    <div className="min-h-screen bg-[#ffeee2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link href={backHref} className="mb-4 inline-block text-sm text-[#194abb] hover:underline">
          ← {backLabel}
        </Link>

        <h1 className="mb-1 text-xl font-semibold text-slate-900">{heading}</h1>
        <p className="mb-6 text-sm text-slate-500">{subheading}</p>

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
              defaultValue={defaultValues?.title}
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
              defaultValue={defaultValues?.description}
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
                defaultValue={defaultValues?.startDate}
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
                defaultValue={defaultValues?.endDate}
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
                defaultValue={defaultValues?.category ?? ""}
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
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                {EVENT_TYPE_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {EVENT_TYPE_INFO[t].label}
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
                defaultValue={defaultValues?.location}
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
                defaultValue={defaultValues?.institutions}
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
                defaultValue={defaultValues?.priority ?? "MEDIUM"}
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
                defaultValue={defaultValues?.confirmationStatus ?? "CONFIRMED"}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                <option value="CONFIRMED">Bestätigt</option>
                <option value="TENTATIVE">Vorläufig</option>
              </select>
            </div>
          </div>

          {type === "EVENT" && (
            <div>
              <label htmlFor="participants" className="mb-1 block text-sm font-medium text-slate-700">
                Teilnehmer Kiel Institut (optional, ein Name pro Zeile)
              </label>
              <textarea
                id="participants"
                name="participants"
                rows={3}
                defaultValue={defaultValues?.participants}
                placeholder={"Max Mustermann\nErika Musterfrau"}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label htmlFor="source" className="mb-1 block text-sm font-medium text-slate-700">
              Quellenbezeichnung (optional)
            </label>
            <input
              id="source"
              name="source"
              type="text"
              defaultValue={defaultValues?.source}
              placeholder="z. B. EU-Rat"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="rounded-md border border-[#194abb]/30 bg-[#edf1fa] p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">
              Quellennachweis{" "}
              {existingAttachments.length === 0 && (
                <span className="text-[#194abb]">— Link oder PDF ist erforderlich</span>
              )}
            </p>

            {existingAttachments.length > 0 && (
              <div className="mb-3 flex flex-col gap-1">
                {existingAttachments.map((a) => (
                  <a
                    key={a.url}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#194abb] hover:underline"
                  >
                    Vorhandenes PDF: {a.fileName}
                  </a>
                ))}
              </div>
            )}

            <label htmlFor="sourceUrl" className="mb-1 block text-sm font-medium text-slate-700">
              Link zur Quelle
            </label>
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              defaultValue={defaultValues?.sourceUrl}
              placeholder="https://…"
              className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />

            <label htmlFor="sourcePdf" className="mb-1 block text-sm font-medium text-slate-700">
              {existingAttachments.length > 0
                ? "weitere PDF(s) hochladen (optional)"
                : "oder PDF(s) hochladen (mehrere möglich)"}
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
            {pending ? submitPendingLabel : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
