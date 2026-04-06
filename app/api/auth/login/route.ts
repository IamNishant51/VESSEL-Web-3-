import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { verifyWalletAuth } from "@/lib/auth";
import { generateToken } from "@/lib/jwt";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Verify wallet authentication
    const authResult = await verifyWalletAuth(request);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const walletAddress = authResult.publicKey.toBase58();

    // Extract device info from request headers
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const deviceId = randomBytes(16).toString("hex");
    const now = new Date();

    // Check if user exists
    let user = await User.findOne({ walletAddress });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        walletAddress,
        agentCount: 0,
        totalEarnings: 0,
        preferences: {
          theme: "dark",
          language: "en",
          notifications: true,
        },
        deviceTokens: [
          {
            id: deviceId,
            ip,
            userAgent,
            lastActive: now,
            name: extractDeviceName(userAgent),
          },
        ],
        lastLogin: now,
        premiumTier: "free",
      });
    } else {
      // Update existing user with device info and last login
      if (!user.deviceTokens) user.deviceTokens = [];

      // Check if device already exists, update lastActive
      const existingDevice = user.deviceTokens.find((d) => d.id === deviceId);
      if (existingDevice) {
        existingDevice.lastActive = now;
      } else {
        user.deviceTokens.push({
          id: deviceId,
          ip,
          userAgent,
          lastActive: now,
          name: extractDeviceName(userAgent),
        });
      }

      user.lastLogin = now;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie with token
    const response = NextResponse.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        agentCount: user.agentCount,
        totalEarnings: user.totalEarnings,
        createdAt: user.createdAt,
        preferences: user.preferences || {
          theme: "dark",
          language: "en",
          notifications: true,
        },
        premiumTier: user.premiumTier || "free",
      },
      deviceId,
    });

    // Set HTTP-only cookie for security
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function extractDeviceName(userAgent: string): string {
  if (!userAgent) return "Unknown Device";

  // Simple device name extraction from user agent
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  if (userAgent.includes("Mobile")) return "Mobile";
  if (userAgent.includes("iPhone")) return "iPhone";
  if (userAgent.includes("Android")) return "Android";

  return "Web Browser";
}