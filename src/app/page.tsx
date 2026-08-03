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
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Kiel Institut Radar
              </h1>
            </div>
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
