"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
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

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
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
            const parts = [categoryLabel];
            if (description) parts.push(description);
            info.el.setAttribute("title", parts.join("\n"));
          }}
        />
      </div>
    </div>
  );
}
