"use client";

import FullCalendar from "@fullcalendar/react";
import type { EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { CATEGORY_INFO, CATEGORY_ORDER } from "@/lib/categories";
import { EVENT_TYPE_INFO, EVENT_TYPE_ORDER } from "@/lib/event-types";
import type { EventType } from "@/generated/prisma/enums";

function renderEventContent(arg: EventContentArg) {
  const type = arg.event.extendedProps.type as EventType | undefined;
  const Icon = type ? EVENT_TYPE_INFO[type].icon : undefined;
  const color = arg.event.backgroundColor || arg.event.borderColor || "#64748b";

  return (
    <div className="flex min-w-0 items-center gap-1">
      {Icon && <Icon size={12} color={color} className="shrink-0" aria-hidden="true" />}
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="truncate">{arg.event.title}</span>
    </div>
  );
}

export default function CalendarView() {
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

      <div className="rounded-lg border border-[#b7c6e8] bg-[#edf1fa] p-3 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, multiMonthPlugin]}
          initialView="multiMonthFour"
          views={{
            multiMonthTwo: {
              type: "multiMonth",
              duration: { months: 2 },
              multiMonthMaxColumns: 2,
            },
            multiMonthThree: {
              type: "multiMonth",
              duration: { months: 3 },
              multiMonthMaxColumns: 3,
            },
            multiMonthFour: {
              type: "multiMonth",
              duration: { months: 4 },
              multiMonthMaxColumns: 2,
            },
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,dayGridMonth,multiMonthTwo,multiMonthThree,multiMonthFour",
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
          events="/api/events"
          eventContent={renderEventContent}
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
            const attachments = (info.event.extendedProps.attachments ?? []) as Array<{
              fileName: string;
            }>;

            const parts = [[typeLabel, categoryLabel].filter(Boolean).join(" · ")];
            if (location) parts.push(`Ort: ${location}`);
            if (institutions) parts.push(`Institution(en): ${institutions}`);
            if (confirmationStatus === "TENTATIVE") parts.push("Status: vorläufig");
            if (description) parts.push(description);
            if (attachments.length > 0) {
              parts.push(`Quelle: ${attachments.map((a) => a.fileName).join(", ")}`);
            }
            info.el.setAttribute("title", parts.join("\n"));
            if (info.event.extendedProps.sourceUrl || attachments.length > 0) {
              info.el.style.cursor = "pointer";
            }
          }}
          eventClick={(info) => {
            const sourceUrl = info.event.extendedProps.sourceUrl as string | undefined;
            const attachments = (info.event.extendedProps.attachments ?? []) as Array<{
              url: string;
            }>;
            const target = sourceUrl || attachments[0]?.url;
            if (target) {
              window.open(target, "_blank", "noopener,noreferrer");
            }
          }}
        />
      </div>
    </div>
  );
}
