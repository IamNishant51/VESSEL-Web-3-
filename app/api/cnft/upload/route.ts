import { NextRequest, NextResponse } from "next/server";
import { uploadCnftImage } from "@/lib/imagekit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, fileName, agentId } = body;

    if (!imageData || !fileName) {
      return NextResponse.json(
        { error: "imageData and fileName are required" },
        { status: 400 }
      );
    }

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const folder = agentId ? `/cnft/agents/${agentId}` : "/cnft/agents";
    const result = await uploadCnftImage(buffer, fileName, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
    });
  } catch (error) {
    console.error("cNFT upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload cNFT image" },
      { status: 500 }
    );
  }
}
