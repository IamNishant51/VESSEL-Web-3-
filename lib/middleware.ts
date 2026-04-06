import { NextResponse, NextFetchEvent } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models";

/**
 * Middleware to validate JWT token and attach user to request
 */
export async function authenticateMiddleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  try {
    // Get token from cookies (more secure than headers for web apps)
    const token = request.cookies.get("token")?.value;
    
    // Also check Authorization header as fallback
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader) {
        const tokenParts = authHeader.split(" ");
        if (tokenParts.length === 2 && tokenParts[0] === "Bearer") {
          // Token will be extracted in verifyToken function
        }
      }
    }
    
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    // Connect to database and fetch user
    await connectToDatabase();
    const user = await User.findOne({ walletAddress: payload.walletAddress });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Attach user to request for use in route handlers
    // @ts-ignore - extending NextRequest type
    request.user = user;
    
    // Continue to next middleware/handler
    return NextResponse.next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Wrapper function to apply authentication to API routes
 */
export function withAuth(
  handler: (request: NextRequest, event: NextFetchEvent) => Promise<NextResponse>
) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const authResponse = await authenticateMiddleware(request, event);
    // Check if response is a NextResponse (not the next() continuation)
    if (authResponse instanceof NextResponse) {
      return authResponse; // Return error response if authentication failed
    }
    return handler(request, event);
  };
}