import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, adminErrorResponse } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(req))) return adminErrorResponse();
  const { id } = await params;
  const body = await req.json();
  const existing = await db.category.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.category.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      description: body.description !== undefined ? body.description || null : existing.description,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl || null : existing.imageUrl,
      icon: body.icon !== undefined ? body.icon || null : existing.icon,
      active: body.active != null ? Boolean(body.active) : existing.active,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(req))) return adminErrorResponse();
  const { id } = await params;
  await db.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
