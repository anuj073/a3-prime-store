import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, adminErrorResponse } from "@/lib/auth";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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

  const buffer = Buffer.from(await file.arrayBuffer());

  // Optimize image with sharp - resize to max 1200px, convert to webp
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const fileName = `${randomUUID()}.webp`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await fs.mkdir(uploadDir, { recursive: true });

    let processed: Buffer;
    try {
      processed = await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      // If sharp fails (e.g., svg), just save original
      processed = buffer;
    }

    await fs.writeFile(path.join(uploadDir, fileName), processed);

    const publicUrl = `/uploads/${fileName}`;
    return NextResponse.json({
      url: publicUrl,
      originalName: file.name,
      size: processed.length,
      format: ext.replace(".", ""),
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
