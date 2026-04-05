import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export async function uploadCnftImage(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "/cnft/agents"
): Promise<{ url: string; fileId: string }> {
  try {
    const response = await imagekit.upload({
      file: fileBuffer.toString("base64"),
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      responseFields: ["url", "fileId"],
    });

    return {
      url: response.url,
      fileId: response.fileId,
    };
  } catch (error) {
    console.error("ImageKit upload failed:", error);
    throw new Error(`Failed to upload image to ImageKit: ${error}`);
  }
}

export async function deleteCnftImage(fileId: string): Promise<void> {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error("ImageKit delete failed:", error);
    throw new Error(`Failed to delete image from ImageKit: ${error}`);
  }
}

export function getImageKitUrl(
  fileId: string,
  transformations?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpg" | "png";
  }
): string {
  const baseUrl = `${process.env.IMAGEKIT_URL_ENDPOINT || ""}${fileId}`;
  
  if (!transformations) {
    return baseUrl;
  }

  const params: string[] = [];
  
  if (transformations.width) {
    params.push(`w-${transformations.width}`);
  }
  if (transformations.height) {
    params.push(`h-${transformations.height}`);
  }
  if (transformations.quality) {
    params.push(`q-${transformations.quality}`);
  }
  if (transformations.format) {
    params.push(`f-${transformations.format}`);
  }

  return params.length > 0 
    ? `${baseUrl}?tr=${params.join(",")}`
    : baseUrl;
}

export default imagekit;
