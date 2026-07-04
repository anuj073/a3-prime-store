import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Resets admin password to default "admin123" if the provided ownerName matches.
// This is a lightweight recovery mechanism: the owner name acts as a recovery key.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ownerName } = body;

  const settings = await db.storeSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    return NextResponse.json({ error: "Store not initialized" }, { status: 400 });
  }

  // Recovery requires knowing the owner name (case-insensitive, trimmed)
  if (
    !ownerName ||
    !settings.ownerName ||
    ownerName.trim().toLowerCase() !== settings.ownerName.trim().toLowerCase()
  ) {
    return NextResponse.json({ error: "Owner name does not match" }, { status: 401 });
  }

  await db.storeSettings.update({
    where: { id: "singleton" },
    data: { adminPassword: "admin123" },
  });

  return NextResponse.json({ success: true, message: "Password reset to default: admin123" });
}
