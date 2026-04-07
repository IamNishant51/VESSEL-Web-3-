import { NextResponse, NextFetchEvent } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models";

export async function authenticateMiddleware(
  request: NextRequest,
  _event?: NextFetchEvent
) {
  try {
    let token = request.cookies.get("token")?.value;
    
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader) {
        token = extractTokenFromHeader(authHeader) || undefined;
      }
    }
    
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    await connectToDatabase();
    const user = await User.findOne({ walletAddress: payload.walletAddress });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return { user, payload };
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return { error: "Internal server error" };
  }
}

export function withAuth(
  handler: (request: NextRequest, event: NextFetchEvent, user: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const authResult = await authenticateMiddleware(request, event);

    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 500 });
    }
    
    if (!("user" in authResult)) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }
    
    const { user } = authResult;
    // @ts-expect-error - extending NextRequest type
    request.user = user;
    
    return handler(request, event, user);
  };
}