"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_INFO } from "@/lib/categories";
import { EVENT_TYPE_INFO } from "@/lib/event-types";
import type { EventCategory, EventType } from "@/generated/prisma/enums";

export interface CreateEventFormState {
  error?: string;
}

function parseDateOnly(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isEventCategory(value: string): value is EventCategory {
  return value in CATEGORY_INFO;
}

function isEventType(value: string): value is EventType {
  return value in EVENT_TYPE_INFO;
}

export async function createEvent(
  _prevState: CreateEventFormState,
  formData: FormData
): Promise<CreateEventFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startDateRaw = String(formData.get("startDate") ?? "");
  const endDateRaw = String(formData.get("endDate") ?? "");
  const categoryRaw = String(formData.get("category") ?? "");
  const typeRaw = String(formData.get("type") ?? "");
  const source = String(formData.get("source") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const institutions = String(formData.get("institutions") ?? "").trim();
  const priorityRaw = String(formData.get("priority") ?? "MEDIUM");
  const confirmationStatusRaw = String(formData.get("confirmationStatus") ?? "CONFIRMED");
  const attachments = formData
    .getAll("sourcePdf")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!title) {
    return { error: "Titel ist erforderlich." };
  }

  const startDate = parseDateOnly(startDateRaw);
  if (!startDate) {
    return { error: "Startdatum ist erforderlich und muss gültig sein." };
  }

  const endDate = endDateRaw ? parseDateOnly(endDateRaw) : null;
  if (endDateRaw && !endDate) {
    return { error: "Enddatum ist ungültig." };
  }
  if (endDate && endDate < startDate) {
    return { error: "Enddatum darf nicht vor dem Startdatum liegen." };
  }

  if (!isEventCategory(categoryRaw)) {
    return { error: "Bitte eine gültige Kategorie auswählen." };
  }

  if (!isEventType(typeRaw)) {
    return { error: "Bitte einen gültigen Termin-Typ auswählen." };
  }

  if (priorityRaw !== "LOW" && priorityRaw !== "MEDIUM" && priorityRaw !== "HIGH") {
    return { error: "Ungültige Priorität." };
  }

  if (confirmationStatusRaw !== "CONFIRMED" && confirmationStatusRaw !== "TENTATIVE") {
    return { error: "Ungültiger Status." };
  }

  if (!sourceUrl && attachments.length === 0) {
    return { error: "Bitte einen Link oder mindestens ein PDF als Quelle angeben." };
  }

  if (attachments.some((file) => file.type !== "application/pdf")) {
    return { error: "Alle Quelldateien müssen PDFs sein." };
  }

  const event = await prisma.event.create({
    data: {
      title,
      description: description || null,
      startDate,
      endDate,
      category: categoryRaw,
      type: typeRaw,
      status: "PUBLISHED",
      source: source || null,
      sourceUrl: sourceUrl || null,
      location: location || null,
      institutions: institutions || null,
      priority: priorityRaw,
      confirmationStatus: confirmationStatusRaw,
    },
  });

  for (const file of attachments) {
    const data = Buffer.from(await file.arrayBuffer());
    await prisma.eventAttachment.create({
      data: {
        eventId: event.id,
        fileName: file.name,
        fileType: file.type,
        data,
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function approveEvent(id: string) {
  await prisma.event.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectEvent(id: string) {
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin");
}
