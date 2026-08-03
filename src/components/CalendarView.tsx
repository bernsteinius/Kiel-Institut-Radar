"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import type { DatesSetArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { CATEGORY_INFO, CATEGORY_ORDER, PUBLICATION_COLOR } from "@/lib/categories";
import { EVENT_TYPE_INFO, EVENT_TYPE_ORDER } from "@/lib/event-types";
import type { EventType } from "@/generated/prisma/enums";

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
  { view: "timeGridWeek", label: "Woche" },
  { view: "dayGridMonth", label: "Monat" },
  { view: "multiMonthTwo", label: "2 Monate" },
  { view: "multiMonthThree", label: "3 Monate" },
  { view: "multiMonthFour", label: "4 Monate" },
];

export default function CalendarView() {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar | null>(null);
  const [activeView, setActiveView] = useState("multiMonthFour");

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-3">
        {CATEGORY_ORDER.map((category) => {
          const info = CATEGORY_INFO[category];
          return (
            <span key={category} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: info.color }}
              />
              {info.label}
            </span>
          );
        })}
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: PUBLICATION_COLOR }}
          />
          Publikationen (alle Kategorien)
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        {EVENT_TYPE_ORDER.map((type) => {
          const info = EVENT_TYPE_INFO[type];
          const Icon = info.icon;
          return (
            <span key={type} className="flex items-center gap-1.5 text-xs text-slate-500">
              <Icon size={13} aria-hidden="true" />
              {info.label}
            </span>
          );
        })}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
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
          plugins={[dayGridPlugin, timeGridPlugin, multiMonthPlugin]}
          initialView="multiMonthFour"
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
            right: "",
          }}
          locale="de"
          firstDay={1}
          height="auto"
          dayMaxEvents={false}
          events="/api/events"
          eventContent={renderEventContent}
          datesSet={(arg: DatesSetArg) => setActiveView(arg.view.type)}
          eventDidMount={(info) => {
            const description = info.event.extendedProps.description as
              | string
              | undefined;
            const categoryLabel = info.event.extendedProps.categoryLabel as string;
            const typeLabel = info.event.extendedProps.typeLabel as string | undefined;
            const location = info.event.extendedProps.location as string | undefined;
            const institutions = info.event.extendedProps.institutions as string | undefined;
            const confirmationStatus = info.event.extendedProps.confirmationStatus as
              | string
              | undefined;
            const participants = (info.event.extendedProps.participants ?? []) as string[];
            const attachments = (info.event.extendedProps.attachments ?? []) as Array<{
              fileName: string;
            }>;

            const parts = [[typeLabel, categoryLabel].filter(Boolean).join(" · ")];
            if (location) parts.push(`Ort: ${location}`);
            if (institutions) parts.push(`Institution(en): ${institutions}`);
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
