import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Demo reset is disabled in production mode.",
    },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Demo reset is disabled in production mode.",
    },
    {
      status: 410,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
