import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { verifyRefreshToken, generateToken, generateRefreshToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get refresh token from cookie
    const refreshToken = request.cookies.get("refreshToken")?.value;
    
    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 401 });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    // Find user
    const user = await User.findOne({ walletAddress: payload.walletAddress });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new access and refresh tokens
    const accessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Set cookies with new tokens
    const response = NextResponse.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        agentCount: user.agentCount,
        totalEarnings: user.totalEarnings,
        createdAt: user.createdAt,
      },
    });

    // Set HTTP-only cookies for security
    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}