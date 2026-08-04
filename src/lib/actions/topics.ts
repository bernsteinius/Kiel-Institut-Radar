"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_INFO } from "@/lib/categories";
import type { EventCategory } from "@/generated/prisma/enums";

export interface CreateTopicFormState {
  error?: string;
}

function isEventCategory(value: string): value is EventCategory {
  return value in CATEGORY_INFO;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createTopic(
  _prevState: CreateTopicFormState,
  formData: FormData
): Promise<CreateTopicFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "");

  if (!name) {
    return { error: "Name des Themas ist erforderlich." };
  }
  if (!isValidUrl(url)) {
    return { error: "Bitte eine gültige URL (http:// oder https://) angeben." };
  }
  if (!isEventCategory(categoryRaw)) {
    return { error: "Bitte eine gültige Kategorie auswählen." };
  }

  await prisma.topic.create({
    data: { name, url, category: categoryRaw },
  });

  revalidatePath("/themen");
  redirect("/themen");
}

export async function updateTopic(
  id: string,
  _prevState: CreateTopicFormState,
  formData: FormData
): Promise<CreateTopicFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "");

  if (!name) {
    return { error: "Name des Themas ist erforderlich." };
  }
  if (!isValidUrl(url)) {
    return { error: "Bitte eine gültige URL (http:// oder https://) angeben." };
  }
  if (!isEventCategory(categoryRaw)) {
    return { error: "Bitte eine gültige Kategorie auswählen." };
  }

  await prisma.topic.update({
    where: { id },
    data: { name, url, category: categoryRaw },
  });

  revalidatePath("/themen");
  redirect("/themen");
}

export async function deleteTopic(id: string) {
  await prisma.topic.delete({ where: { id } });
  revalidatePath("/themen");
}
