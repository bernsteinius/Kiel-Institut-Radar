import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const attachment = await prisma.eventAttachment.findUnique({
    where: { id },
  });

  if (!attachment) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(attachment.data), {
    headers: {
      "Content-Type": attachment.fileType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.fileName)}"`,
    },
  });
}
