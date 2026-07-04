import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password } = body;

  let settings = await db.storeSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    settings = await db.storeSettings.create({ data: { id: "singleton" } });
  }

  if (password !== settings.adminPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  return NextResponse.json({
    token: settings.adminPassword,
    storeName: settings.storeName,
  });
}
