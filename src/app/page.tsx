import Link from "next/link";
import CalendarView from "@/components/CalendarView";
import { logout } from "@/lib/actions/auth";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ffeee2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/kiel-institut-logo.svg"
              alt="Kiel Institut Logo"
              width={140}
              height={49}
            />
            <div className="hidden h-10 w-px bg-slate-300 sm:block" />
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[#ff6a00] sm:text-3xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/radar-icon.svg"
                alt=""
                width={36}
                height={36}
                className="h-8 w-8 sm:h-9 sm:w-9"
              />
              Radar
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/neu"
              className="rounded-md bg-[#ff6a00] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e05f00]"
            >
              + Termin anlegen
            </Link>
            <Link
              href="/themen"
              className="rounded-md bg-[#194abb] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#143c96]"
            >
              + Neues Suchthema
            </Link>
            <Link
              href="/admin"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Freigabe
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Abmelden
              </button>
            </form>
          </div>
        </div>

        <CalendarView />
      </div>
    </div>
  );
}
