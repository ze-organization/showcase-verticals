import { NextResponse } from "next/server";
import { createGeocoder } from "@/lib/registry/maps/create-geocoder";

/**
 * Demo geocode proxy. Nominatim must be called server-side (CORS +
 * User-Agent). Swap the vendor in `create-geocoder.ts`.
 *
 * Matcher in `src/proxy.ts` already skips `/api/*`.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ error: "missing q" }, { status: 400 });
  }

  try {
    const result = await createGeocoder().geocode(query);
    if (!result) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "geocode failed" }, { status: 502 });
  }
}
