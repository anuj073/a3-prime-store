import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, adminErrorResponse } from "@/lib/auth";

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
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
