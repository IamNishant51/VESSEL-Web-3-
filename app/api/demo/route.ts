import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Demo endpoints are disabled in production mode.",
    },
    { status: 410 },
  );
}
