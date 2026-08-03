"use server";

import { createHash, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export interface LoginFormState {
  error?: string;
}

function passwordsMatch(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.SITE_PASSWORD ?? "";

  if (!password || !expected || !passwordsMatch(password, expected)) {
    // Kleine Verzögerung erschwert automatisiertes Durchprobieren.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { error: "Falsches Passwort." };
  }

  const session = await getSession();
  session.authenticated = true;
  await session.save();

  redirect("/");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
