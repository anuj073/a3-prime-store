import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, adminErrorResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

// Public: returns store settings (minus admin password)
export async function GET() {
  let settings = await db.storeSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    settings = await db.storeSettings.create({
      data: { id: "singleton" },
    });
  }
  const { adminPassword, ...publicSettings } = settings;
  return NextResponse.json(publicSettings, { headers: NO_CACHE });
}

// Admin: update store settings
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) return adminErrorResponse();
  const body = await req.json();

  let settings = await db.storeSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    settings = await db.storeSettings.create({ data: { id: "singleton" } });
  }

  const updated = await db.storeSettings.update({
    where: { id: "singleton" },
    data: {
      storeName: body.storeName ?? settings.storeName,
      tagline: body.tagline ?? settings.tagline,
      ownerName: body.ownerName ?? settings.ownerName,
      address: body.address ?? settings.address,
      phone: body.phone ?? settings.phone,
      email: body.email !== undefined ? body.email || null : settings.email,
      logoUrl: body.logoUrl !== undefined ? body.logoUrl || null : settings.logoUrl,
      heroTitle: body.heroTitle ?? settings.heroTitle,
      heroSubtitle: body.heroSubtitle ?? settings.heroSubtitle,
      heroImageUrl: body.heroImageUrl !== undefined ? body.heroImageUrl || null : settings.heroImageUrl,
      announcement: body.announcement !== undefined ? body.announcement || null : settings.announcement,
      adminPassword: body.adminPassword
        ? String(body.adminPassword)
        : settings.adminPassword,
      whatsapp: body.whatsapp !== undefined ? body.whatsapp || null : settings.whatsapp,
      instagram: body.instagram !== undefined ? body.instagram || null : settings.instagram,
      facebook: body.facebook !== undefined ? body.facebook || null : settings.facebook,
      freeShipMsg: body.freeShipMsg ?? settings.freeShipMsg,
    },
  });

  const { adminPassword, ...publicSettings } = updated;
  return NextResponse.json({
    ...publicSettings,
    passwordUpdated: !!body.adminPassword,
  });
}
