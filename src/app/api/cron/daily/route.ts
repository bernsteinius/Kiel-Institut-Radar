import { NextRequest, NextResponse } from "next/server";
import { ingestAll } from "@/lib/ingest";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const summaries = await ingestAll();
  return NextResponse.json({ ranAt: new Date().toISOString(), summaries });
}
