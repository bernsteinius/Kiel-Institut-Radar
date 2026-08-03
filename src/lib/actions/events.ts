"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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
