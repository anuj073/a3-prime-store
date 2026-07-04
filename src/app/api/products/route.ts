import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, adminErrorResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");
  const admin = searchParams.get("admin") === "true";

  const where: Record<string, unknown> = {};
  if (!admin) where.active = true;
  if (category && category !== "all") where.category = category;
  if (featured === "true") where.featured = true;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { brand: { contains: search } },
    ];
  }

  const products = await db.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    products.map((p) => ({
      ...p,
      images: safeParse(p.images),
    }))
  );
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) return adminErrorResponse();

  const body = await req.json();
  const {
    name,
    description,
    price,
    originalPrice,
    category,
    imageUrl,
    images,
    stock,
    unit,
    brand,
    featured,
    active,
    showPrice,
    rating,
  } = body;

  if (!name || price == null) {
    return NextResponse.json(
      { error: "Name and price are required" },
      { status: 400 }
    );
  }

  const product = await db.product.create({
    data: {
      name,
      description: description || "",
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      category: category || null,
      imageUrl: imageUrl || null,
      images: JSON.stringify(images || (imageUrl ? [imageUrl] : [])),
      stock: Number(stock) || 0,
      unit: unit || null,
      brand: brand || null,
      featured: Boolean(featured),
      active: active !== false,
      showPrice: showPrice != null ? Boolean(showPrice) : true,
      rating: Number(rating) || 0,
    },
  });

  return NextResponse.json({
    ...product,
    images: safeParse(product.images),
  });
}

function safeParse(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
