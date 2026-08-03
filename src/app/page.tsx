import CalendarView from "@/components/CalendarView";
import { logout } from "@/lib/actions/auth";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Kiel Institut Radar
            </h1>
            <p className="text-sm text-slate-500">
              EU, NATO, FED, IWF/Weltbank, G7 und weitere wirtschaftspolitische Termine
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Abmelden
            </button>
          </form>
        </div>

        <CalendarView />
      </div>
    </div>
  );
}
