import { NextRequest, NextResponse } from "next/server";
import { uploadCnftImage } from "@/lib/imagekit";
import { verifyWalletAuth } from "@/lib/auth";
import sharp from "sharp";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_CONTENT_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILENAME_LENGTH = 100;

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyWalletAuth(request);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { imageData, fileName, agentId } = body;

    if (!imageData || !fileName) {
      return NextResponse.json({ error: "imageData and fileName are required" }, { status: 400 });
    }

    if (typeof fileName !== "string" || fileName.length > MAX_FILENAME_LENGTH) {
      return NextResponse.json({ error: `Filename must be under ${MAX_FILENAME_LENGTH} characters` }, { status: 400 });
    }

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, MAX_FILENAME_LENGTH);

    if (!/^data:image\/(png|jpeg|webp);base64,/.test(imageData)) {
      return NextResponse.json({ error: "Invalid image format. Only PNG, JPEG, and WebP allowed" }, { status: 400 });
    }

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    
    if (base64Data.length > MAX_IMAGE_SIZE_BYTES * 1.37) {
      return NextResponse.json({ error: `Image too large. Maximum size: ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB` }, { status: 413 });
    }

    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: `Image too large. Maximum size: ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB` }, { status: 413 });
    }

    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.format || !ALLOWED_CONTENT_TYPES.includes(`image/${metadata.format}`)) {
      return NextResponse.json({ error: "Invalid image content. Only PNG, JPEG, and WebP allowed" }, { status: 400 });
    }

    if (metadata.width && metadata.width > 4096) {
      return NextResponse.json({ error: "Image width too large. Maximum: 4096px" }, { status: 400 });
    }

    if (metadata.height && metadata.height > 4096) {
      return NextResponse.json({ error: "Image height too large. Maximum: 4096px" }, { status: 400 });
    }

    const folder = agentId ? `/cnft/agents/${agentId.replace(/[^a-zA-Z0-9_-]/g, "")}` : "/cnft/agents";
    const result = await uploadCnftImage(buffer, sanitizedFileName, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
    });
  } catch {
    return NextResponse.json({ error: "Failed to upload cNFT image" }, { status: 500 });
  }
}
