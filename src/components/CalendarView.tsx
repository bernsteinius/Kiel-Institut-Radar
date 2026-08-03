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
          initialView="multiMonthThree"
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
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,dayGridMonth,multiMonthTwo,multiMonthThree",
          }}
          buttonText={{
            week: "Woche",
            month: "Monat",
            multiMonthTwo: "2 Monate",
            multiMonthThree: "3 Monate",
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
