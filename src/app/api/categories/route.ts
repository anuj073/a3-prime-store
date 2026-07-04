import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, adminErrorResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories, { headers: NO_CACHE });
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) return adminErrorResponse();
  const body = await req.json();
  const { name, description, imageUrl, icon, active } = body;
  if (!name)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  try {
    const category = await db.category.create({
      data: {
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        icon: icon || null,
        active: active !== false,
      },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { error: "Category with this name already exists" },
      { status: 400 }
    );
  }
}
