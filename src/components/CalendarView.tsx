"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { CATEGORY_INFO, CATEGORY_ORDER } from "@/lib/categories";

export default function CalendarView() {
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
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
          eventDidMount={(info) => {
            const description = info.event.extendedProps.description as
              | string
              | undefined;
            const categoryLabel = info.event.extendedProps.categoryLabel as string;
            const attachments = (info.event.extendedProps.attachments ?? []) as Array<{
              fileName: string;
            }>;
            const parts = [categoryLabel];
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
