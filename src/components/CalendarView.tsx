"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import type { DatesSetArg, EventContentArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { VISIBILITY_GROUPS, type VisibilityGroup } from "@/lib/categories";
import { EVENT_TYPE_INFO, EVENT_TYPE_ORDER } from "@/lib/event-types";
import { PUBLICATION_TOPICS } from "@/lib/publication-topics";
import type { EventType } from "@/generated/prisma/enums";

const HIDDEN_GROUPS_STORAGE_KEY = "radar-hidden-groups";
const HIDDEN_TOPICS_STORAGE_KEY = "radar-hidden-topics";
// Merkt sich die zuletzt angezeigte Kalenderposition (View + Datum) in
// sessionStorage, damit ein Klick auf einen Termin und "Zurück zum Kalender"
// wieder an derselben Stelle landet, statt beim heutigen Tag neu zu starten.
const CALENDAR_POSITION_STORAGE_KEY = "radar-calendar-position";

function renderEventContent(arg: EventContentArg) {
  const type = arg.event.extendedProps.type as EventType | undefined;
  const Icon = type ? EVENT_TYPE_INFO[type].icon : undefined;

  return (
    <div className="flex min-w-0 items-center gap-1.5 px-0.5">
      {Icon && (
        <Icon size={13} color="#ffffff" strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
      )}
      <span className="truncate">{arg.event.title}</span>
    </div>
  );
}

const VIEW_SWITCHER: Array<{ view: string; label: string }> = [
  { view: "dayGridWeek", label: "Woche" },
  { view: "dayGridMonth", label: "Monat" },
  { view: "multiMonthTwo", label: "2 Monate" },
  { view: "multiMonthThree", label: "3 Monate" },
  { view: "multiMonthFour", label: "4 Monate" },
];

export default function CalendarView() {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar | null>(null);
  // Einmalig (nicht bei jedem Re-Render) die zuletzt gemerkte Kalenderposition
  // lesen und direkt als Startposition verwenden, statt sie erst nach dem
  // Mounten per changeView() nachträglich anzuspringen - so gibt es keinen
  // Wettlauf mit FullCalendars eigenem initialem datesSet-Aufruf, der diese
  // Position sonst überschreiben könnte (u.a. bei React Strict Mode im
  // Entwicklungsmodus, das Effekte doppelt ausführt).
  const [initialPosition] = useState<{ view: string; date: string } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(CALENDAR_POSITION_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as { view: string; date: string }) : null;
    } catch {
      return null;
    }
  });
  const [activeView, setActiveView] = useState(initialPosition?.view ?? "multiMonthFour");
  const [allEvents, setAllEvents] = useState<EventInput[]>([]);
  const [hiddenGroups, setHiddenGroups] = useState<Set<VisibilityGroup>>(new Set());
  const [hiddenTopics, setHiddenTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then(setAllEvents);
  }, []);

  useEffect(() => {
    // Einmaliges Hydrieren der Sichtbarkeits-Auswahl aus localStorage nach
    // dem ersten Render (server-seitig gibt es kein localStorage, daher
    // erst hier statt in einem lazy useState-Initializer, um einen
    // Hydration-Mismatch zu vermeiden).
    try {
      const raw = localStorage.getItem(HIDDEN_GROUPS_STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHiddenGroups(new Set(JSON.parse(raw) as VisibilityGroup[]));
      }
      const rawTopics = localStorage.getItem(HIDDEN_TOPICS_STORAGE_KEY);
      if (rawTopics) {
        setHiddenTopics(new Set(JSON.parse(rawTopics) as string[]));
      }
    } catch {
      // localStorage nicht verfügbar (z.B. privater Modus) - Standard: alles sichtbar.
    }
  }, []);

  function toggleGroup(key: VisibilityGroup) {
    setHiddenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      try {
        localStorage.setItem(HIDDEN_GROUPS_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function toggleTopic(topic: string) {
    setHiddenTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      try {
        localStorage.setItem(HIDDEN_TOPICS_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const visibleEvents = useMemo(
    () =>
      allEvents.filter((event) => {
        const group = event.extendedProps?.group as VisibilityGroup | undefined;
        if (group && hiddenGroups.has(group)) return false;

        // Themen-Filter gilt ausschließlich für Publikationen (andere
        // Termine haben keine topics und bleiben davon unberührt). Eine
        // Publikation mit mehreren Themen bleibt sichtbar, solange
        // mindestens eines davon nicht ausgeblendet ist.
        const topics = (event.extendedProps?.topics ?? []) as string[];
        if (topics.length > 0 && topics.every((topic) => hiddenTopics.has(topic))) {
          return false;
        }

        return true;
      }),
    [allEvents, hiddenGroups, hiddenTopics]
  );

  return (
    <div>
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Kategorie ein-/ausblenden
          </p>
          <div className="flex flex-wrap gap-2">
            {VISIBILITY_GROUPS.map(({ key, label, color }) => {
              const hidden = hiddenGroups.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleGroup(key)}
                  aria-pressed={!hidden}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-opacity ${
                    hidden
                      ? "border-slate-200 bg-white text-slate-400 opacity-50"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="my-4 border-t border-slate-100" />

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Termin-Typ
          </p>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPE_ORDER.map((type) => {
              const info = EVENT_TYPE_INFO[type];
              const Icon = info.icon;
              return (
                <span
                  key={type}
                  className="flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <Icon size={14} aria-hidden="true" />
                  {info.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="my-4 border-t border-slate-100" />

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Kiel Institut Publikationsthemen
          </p>
          <div className="flex flex-wrap gap-2">
            {PUBLICATION_TOPICS.map((topic) => {
              const hidden = hiddenTopics.has(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  aria-pressed={!hidden}
                  className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition-opacity ${
                    hidden
                      ? "border-slate-200 bg-white text-slate-400 opacity-50"
                      : "border-[#ffab5e]/50 bg-[#fff3e6] text-[#b5591a]"
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 sm:hidden">
        {VIEW_SWITCHER.map(({ view, label }) => (
          <button
            key={view}
            type="button"
            onClick={() => calendarRef.current?.getApi().changeView(view)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              activeView === view
                ? "bg-[#194abb] text-white"
                : "border border-[#194abb]/30 bg-white text-[#194abb] hover:bg-[#edf1fa]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[#b7c6e8] bg-[#edf1fa] p-3 shadow-sm">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, multiMonthPlugin]}
          initialView={initialPosition?.view ?? "multiMonthFour"}
          initialDate={initialPosition?.date}
          views={{
            multiMonthTwo: {
              type: "multiMonth",
              duration: { months: 2 },
              multiMonthMaxColumns: 2,
              aspectRatio: 0.5,
            },
            multiMonthThree: {
              type: "multiMonth",
              duration: { months: 3 },
              multiMonthMaxColumns: 3,
              aspectRatio: 0.5,
            },
            multiMonthFour: {
              type: "multiMonth",
              duration: { months: 4 },
              multiMonthMaxColumns: 2,
              aspectRatio: 0.5,
            },
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridWeek,dayGridMonth,multiMonthTwo,multiMonthThree,multiMonthFour",
          }}
          buttonText={{
            week: "Woche",
            month: "Monat",
            multiMonthTwo: "2 Monate",
            multiMonthThree: "3 Monate",
            multiMonthFour: "4 Monate",
          }}
          locale="de"
          firstDay={1}
          height="auto"
          dayMaxEvents={false}
          events={visibleEvents}
          eventContent={renderEventContent}
          datesSet={(arg: DatesSetArg) => {
            setActiveView(arg.view.type);
            try {
              sessionStorage.setItem(
                CALENDAR_POSITION_STORAGE_KEY,
                JSON.stringify({ view: arg.view.type, date: arg.view.currentStart.toISOString() })
              );
            } catch {
              // ignore
            }
          }}
          eventDidMount={(info) => {
            const description = info.event.extendedProps.description as
              | string
              | undefined;
            const categoryLabel = info.event.extendedProps.categoryLabel as string;
            const typeLabel = info.event.extendedProps.typeLabel as string | undefined;
            const location = info.event.extendedProps.location as string | undefined;
            const country = info.event.extendedProps.country as string | undefined;
            const locationTime = info.event.extendedProps.locationTime as string | undefined;
            const institutions = info.event.extendedProps.institutions as string | undefined;
            const confirmationStatus = info.event.extendedProps.confirmationStatus as
              | string
              | undefined;
            const participants = (info.event.extendedProps.participants ?? []) as string[];
            const topics = (info.event.extendedProps.topics ?? []) as string[];
            const publicationType = info.event.extendedProps.publicationType as string | undefined;
            const attachments = (info.event.extendedProps.attachments ?? []) as Array<{
              fileName: string;
            }>;

            const parts = [[typeLabel, categoryLabel].filter(Boolean).join(" · ")];
            if (location) parts.push(`Ort: ${location}${country ? `, ${country}` : ""}`);
            if (locationTime) parts.push(`Uhrzeit des Ortes: ${locationTime}`);
            if (institutions) parts.push(`Institution(en): ${institutions}`);
            if (publicationType) parts.push(`Publikationstyp: ${publicationType}`);
            if (topics.length > 0) parts.push(`Themen: ${topics.join(", ")}`);
            if (participants.length > 0) {
              parts.push(`Teilnehmer Kiel Institut: ${participants.join(", ")}`);
            }
            if (confirmationStatus === "TENTATIVE") parts.push("Status: vorläufig");
            if (description) parts.push(description);
            if (attachments.length > 0) {
              parts.push(`Quelle: ${attachments.map((a) => a.fileName).join(", ")}`);
            }
            info.el.setAttribute("title", parts.join("\n"));
            info.el.style.cursor = "pointer";
          }}
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            router.push(`/termine/${info.event.id}`);
          }}
        />
      </div>
    </div>
  );
}
