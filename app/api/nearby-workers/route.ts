import { NextResponse } from "next/server";
import { getWorkers } from "@/lib/workers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "";

  const workers = await getWorkers({
    location: city,
    sort: "rating"
  });

  return NextResponse.json({ workers: workers.slice(0, 10) });
}
