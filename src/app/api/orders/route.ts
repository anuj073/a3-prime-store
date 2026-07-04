import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, adminErrorResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) return adminErrorResponse();
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    orders.map((o) => ({ ...o, items: safeParse(o.items) })),
    { headers: NO_CACHE }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customerName,
    customerPhone,
    customerAddress,
    customerNote,
    items,
    subtotal,
    deliveryCharge,
    total,
  } = body;

  if (!customerName || !customerPhone || !customerAddress || !items?.length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const orderNumber = `A3P${Date.now().toString().slice(-8)}`;

  const order = await db.order.create({
    data: {
      orderNumber,
      customerName,
      customerPhone,
      customerAddress,
      customerNote: customerNote || null,
      items: JSON.stringify(items),
      subtotal: Number(subtotal) || 0,
      deliveryCharge: Number(deliveryCharge) || 0,
      total: Number(total) || 0,
      status: "pending",
    },
  });

  return NextResponse.json({
    ...order,
    items: safeParse(order.items),
  });
}

function safeParse(s: string): unknown[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
