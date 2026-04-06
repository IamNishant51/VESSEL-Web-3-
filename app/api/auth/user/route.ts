import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models";
import { authenticateMiddleware } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authenticate user
    const authResult = await authenticateMiddleware(request);
    if (!authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user from database
    const user = await User.findById(authResult.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        agentCount: user.agentCount,
        totalEarnings: user.totalEarnings,
        preferences: user.preferences || {
          theme: "dark",
          language: "en",
          notifications: true,
        },
        premiumTier: user.premiumTier || "free",
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      devices: user.deviceTokens?.map((d) => ({
        id: d.id,
        name: d.name,
        ip: d.ip,
        lastActive: d.lastActive,
      })) || [],
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authenticate user
    const authResult = await authenticateMiddleware(request);
    if (!authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as {
      preferences?: {
        theme?: "light" | "dark" | "system";
        language?: string;
        notifications?: boolean;
      };
    };

    // Fetch and update user
    const user = await User.findById(authResult.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update preferences
    if (body.preferences) {
      user.preferences = {
        ...user.preferences,
        ...body.preferences,
      };
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        agentCount: user.agentCount,
        totalEarnings: user.totalEarnings,
        preferences: user.preferences,
        premiumTier: user.premiumTier || "free",
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    // Authenticate user
    const authResult = await authenticateMiddleware(request);
    if (!authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId query parameter required" },
        { status: 400 }
      );
    }

    // Remove device from user's deviceTokens
    const user = await User.findById(authResult.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.deviceTokens) {
      user.deviceTokens = user.deviceTokens.filter((d) => d.id !== deviceId);
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Device removed",
    });
  } catch (error) {
    console.error("Delete device error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
