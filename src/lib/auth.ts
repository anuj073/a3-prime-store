import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Simple admin auth via token stored in header
export async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("x-admin-token");
  if (!token) return false;
  const settings = await db.storeSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) return false;
  return token === settings.adminPassword;
}

export function adminErrorResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
