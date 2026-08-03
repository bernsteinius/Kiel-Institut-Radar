"use client";

import { useActionState } from "react";
import { login, type LoginFormState } from "@/lib/actions/auth";

const initialState: LoginFormState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-lg font-semibold text-slate-900">
          Kiel Institut Radar
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Bitte Zugangspasswort eingeben.
        </p>

        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />

        {state?.error && (
          <p className="mb-4 text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "Prüfe…" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}
