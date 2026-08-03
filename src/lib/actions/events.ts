"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_INFO } from "@/lib/categories";
import { EVENT_TYPE_INFO } from "@/lib/event-types";
import { PUBLICATION_TOPICS } from "@/lib/publication-topics";
import { resolveCountry } from "@/lib/countries";
import type {
  EventCategory,
  EventType,
  EventPriority,
  ConfirmationStatus,
} from "@/generated/prisma/enums";

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

interface ParsedEventForm {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  category: EventCategory;
  type: EventType;
  source: string;
  sourceUrl: string;
  location: string;
  country: string;
  locationTime: string;
  institutions: string;
  priority: EventPriority;
  confirmationStatus: ConfirmationStatus;
  participants: string[];
  topics: string[];
  attachments: File[];
}

function parseEventForm(formData: FormData): ParsedEventForm | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startDateRaw = String(formData.get("startDate") ?? "");
  const endDateRaw = String(formData.get("endDate") ?? "");
  const categoryRaw = String(formData.get("category") ?? "");
  const typeRaw = String(formData.get("type") ?? "");
  const source = String(formData.get("source") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const countryInput = String(formData.get("country") ?? "").trim();
  const locationTime = String(formData.get("locationTime") ?? "").trim();
  const institutions = String(formData.get("institutions") ?? "").trim();
  const priorityRaw = String(formData.get("priority") ?? "MEDIUM");
  const confirmationStatusRaw = String(formData.get("confirmationStatus") ?? "CONFIRMED");
  const participants = String(formData.get("participants") ?? "")
    .split("\n")
    .map((name) => name.trim())
    .filter(Boolean);
  const topics = formData.getAll("topics").map(String).filter((t) => PUBLICATION_TOPICS.includes(t));
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

  if (attachments.some((file) => file.type !== "application/pdf")) {
    return { error: "Alle Quelldateien müssen PDFs sein." };
  }

  return {
    title,
    description,
    startDate,
    endDate,
    category: categoryRaw,
    type: typeRaw,
    source,
    sourceUrl,
    location,
    country: resolveCountry(location, countryInput) ?? "",
    locationTime,
    institutions,
    priority: priorityRaw,
    confirmationStatus: confirmationStatusRaw,
    participants,
    topics,
    attachments,
  };
}

async function storeAttachments(eventId: string, attachments: File[]) {
  for (const file of attachments) {
    const data = Buffer.from(await file.arrayBuffer());
    await prisma.eventAttachment.create({
      data: { eventId, fileName: file.name, fileType: file.type, data },
    });
  }
}

export async function createEvent(
  _prevState: CreateEventFormState,
  formData: FormData
): Promise<CreateEventFormState> {
  const parsed = parseEventForm(formData);
  if ("error" in parsed) return parsed;

  if (!parsed.sourceUrl && parsed.attachments.length === 0) {
    return { error: "Bitte einen Link oder mindestens ein PDF als Quelle angeben." };
  }

  const event = await prisma.event.create({
    data: {
      title: parsed.title,
      description: parsed.description || null,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      category: parsed.category,
      type: parsed.type,
      status: "PUBLISHED",
      source: parsed.source || null,
      sourceUrl: parsed.sourceUrl || null,
      location: parsed.location || null,
      country: parsed.country || null,
      locationTime: parsed.locationTime || null,
      institutions: parsed.institutions || null,
      priority: parsed.priority,
      confirmationStatus: parsed.confirmationStatus,
      participants: parsed.participants,
      topics: parsed.topics,
    },
  });

  await storeAttachments(event.id, parsed.attachments);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function updateEvent(
  id: string,
  _prevState: CreateEventFormState,
  formData: FormData
): Promise<CreateEventFormState> {
  const parsed = parseEventForm(formData);
  if ("error" in parsed) return parsed;

  const existing = await prisma.event.findUnique({ where: { id }, select: { status: true } });
  if (!existing) {
    return { error: "Termin wurde nicht gefunden." };
  }

  const existingAttachmentCount = await prisma.eventAttachment.count({ where: { eventId: id } });
  if (!parsed.sourceUrl && parsed.attachments.length === 0 && existingAttachmentCount === 0) {
    return { error: "Bitte einen Link oder mindestens ein PDF als Quelle angeben." };
  }

  await prisma.event.update({
    where: { id },
    data: {
      title: parsed.title,
      description: parsed.description || null,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      category: parsed.category,
      type: parsed.type,
      source: parsed.source || null,
      sourceUrl: parsed.sourceUrl || null,
      location: parsed.location || null,
      country: parsed.country || null,
      locationTime: parsed.locationTime || null,
      institutions: parsed.institutions || null,
      priority: parsed.priority,
      confirmationStatus: parsed.confirmationStatus,
      participants: parsed.participants,
      topics: parsed.topics,
    },
  });

  await storeAttachments(id, parsed.attachments);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/termine/${id}`);

  if (existing.status === "DRAFT") {
    redirect("/admin");
  }
  redirect(`/termine/${id}`);
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
