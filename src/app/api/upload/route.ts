import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, adminErrorResponse } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) return adminErrorResponse();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!file.type.startsWith("image/"))
    return NextResponse.json(
      { error: "Only image files are allowed" },
      { status: 400 }
    );

  const maxSize = 8 * 1024 * 1024; // 8MB
  if (file.size > maxSize)
    return NextResponse.json(
      { error: "File too large (max 8MB)" },
      { status: 400 }
    );

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const b64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(b64, {
      folder: "a3-prime-store",
      resource_type: "image",
      transformation: [
        { width: 1200, height: 1200, crop: "limit", quality: "auto:good" },
      ],
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      originalName: file.name,
      size: result.bytes,
      format: result.format,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      {
        error:
          "Failed to upload image. Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in Vercel environment variables.",
      },
      { status: 500 }
    );
  }
}
