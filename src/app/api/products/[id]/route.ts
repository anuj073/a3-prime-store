import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, adminErrorResponse } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...product, images: safeParse(product.images) });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(req))) return adminErrorResponse();
  const { id } = await params;
  const body = await req.json();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.product.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      price: body.price != null ? Number(body.price) : existing.price,
      originalPrice:
        body.originalPrice != null
          ? body.originalPrice
            ? Number(body.originalPrice)
            : null
          : existing.originalPrice,
      category: body.category !== undefined ? body.category || null : existing.category,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl || null : existing.imageUrl,
      images:
        body.images !== undefined
          ? JSON.stringify(body.images)
          : existing.images,
      stock: body.stock != null ? Number(body.stock) : existing.stock,
      unit: body.unit !== undefined ? body.unit || null : existing.unit,
      brand: body.brand !== undefined ? body.brand || null : existing.brand,
      featured: body.featured != null ? Boolean(body.featured) : existing.featured,
      active: body.active != null ? Boolean(body.active) : existing.active,
      showPrice:
        body.showPrice != null ? Boolean(body.showPrice) : existing.showPrice,
      rating: body.rating != null ? Number(body.rating) : existing.rating,
    },
  });

  return NextResponse.json({
    ...updated,
    images: safeParse(updated.images),
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(req))) return adminErrorResponse();
  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

function safeParse(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
