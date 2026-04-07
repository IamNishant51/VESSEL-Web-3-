import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { POST as legacyDbPost } from "@/app/api/db/route";

export async function forwardDbAction(
  request: NextRequest,
  body: Record<string, unknown>
): Promise<NextResponse> {
  const forwardedRequest = new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify(body),
  });

  return legacyDbPost(forwardedRequest);
}
