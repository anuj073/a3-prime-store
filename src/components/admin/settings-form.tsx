"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Save,
  Loader2,
  Store,
  Phone,
  Image as ImageIcon,
  Home,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUploader } from "./image-uploader";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { StoreSettings } from "@/lib/types";

type SettingsFormProps = {
  token: string;
};

type FormState = {
  storeName: string;
  tagline: string;
  ownerName: string;
  logoUrl: string[];
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string[];
  announcement: string;
  freeShipMsg: string;
  adminPassword: string;
};

function fromSettings(s: StoreSettings): FormState {
  return {
    storeName: s.storeName || "",
    tagline: s.tagline || "",
    ownerName: s.ownerName || "",
    logoUrl: s.logoUrl ? [s.logoUrl] : [],
    phone: s.phone || "",
    email: s.email || "",
    address: s.address || "",
    whatsapp: s.whatsapp || "",
    instagram: s.instagram || "",
    facebook: s.facebook || "",
    heroTitle: s.heroTitle || "",
    heroSubtitle: s.heroSubtitle || "",
    heroImageUrl: s.heroImageUrl ? [s.heroImageUrl] : [],
    announcement: s.announcement || "",
    freeShipMsg: s.freeShipMsg || "",
    adminPassword: "",
  };
}

function emptyForm(): FormState {
  return {
    storeName: "",
    tagline: "",
    ownerName: "",
    logoUrl: [],
    phone: "",
    email: "",
    address: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: [],
    announcement: "",
    freeShipMsg: "",
    adminPassword: "",
  };
}

export function SettingsForm({ token }: SettingsFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s = await api.getSettings();
      setForm(fromSettings(s));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load settings";
      toast.error("Load failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSave = async () => {
    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    const payload: Partial<StoreSettings> & { adminPassword?: string } = {
      storeName: form.storeName.trim(),
      tagline: form.tagline.trim(),
      ownerName: form.ownerName.trim(),
      logoUrl: form.logoUrl[0] || null,
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim(),
      whatsapp: form.whatsapp.trim() || null,
      instagram: form.instagram.trim() || null,
      facebook: form.facebook.trim() || null,
      heroTitle: form.heroTitle.trim(),
      heroSubtitle: form.heroSubtitle.trim(),
      heroImageUrl: form.heroImageUrl[0] || null,
      announcement: form.announcement.trim() || null,
      freeShipMsg: form.freeShipMsg.trim(),
    };
    if (form.adminPassword.trim()) {
      payload.adminPassword = form.adminPassword.trim();
    }

    setSaving(true);
    try {
      await api.updateSettings(payload, token);
      toast.success("Settings saved", {
        description: payload.adminPassword
          ? "Store settings and admin password updated."
          : "Your store settings have been updated.",
      });
      // Clear password field after save
      setForm((f) => ({ ...f, adminPassword: "" }));
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      toast.error("Save failed", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={`sk-${i}`} className="p-6">
              <Skeleton className="h-5 w-40" />
              <div className="mt-4 flex flex-col gap-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Store Settings
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your store identity, contact info, homepage, and security.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-10 min-h-11 gap-2 text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-70"
          style={{ backgroundColor: "var(--brand-orange)" }}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save All Changes
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Store Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store
                className="size-5"
                style={{ color: "var(--brand-blue)" }}
              />
              Store Identity
            </CardTitle>
            <CardDescription>
              Basic info about your store shown across the website.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="Store Name" required>
              <Input
                value={form.storeName}
                onChange={(e) => update("storeName", e.target.value)}
                className="h-10"
                placeholder="A3 Prime Store"
              />
            </Field>
            <Field label="Tagline">
              <Input
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className="h-10"
                placeholder="Your Trusted Neighborhood Store"
              />
            </Field>
            <Field label="Owner Name">
              <Input
                value={form.ownerName}
                onChange={(e) => update("ownerName", e.target.value)}
                className="h-10"
                placeholder="Akash Maurya"
              />
            </Field>
            <Field
              label="Store Logo"
              hint="A square image works best (recommended 512×512)."
            >
              <ImageUploader
                value={form.logoUrl}
                onChange={(urls) => update("logoUrl", urls)}
                token={token}
                max={1}
              />
            </Field>
          </CardContent>
        </Card>

        {/* Contact & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone
                className="size-5"
                style={{ color: "var(--brand-blue)" }}
              />
              Contact &amp; Location
            </CardTitle>
            <CardDescription>
              How customers can reach you. Phone is required.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" required>
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="h-10"
                  placeholder="6391304606"
                  inputMode="tel"
                />
              </Field>
              <Field label="Email">
                <Input
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="h-10"
                  placeholder="store@example.com"
                  inputMode="email"
                />
              </Field>
            </div>
            <Field label="Address">
              <Textarea
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                rows={2}
                className="resize-y"
                placeholder="Bazar Neorhia, Jaunpur - 222128, Uttar Pradesh"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="WhatsApp">
                <Input
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  className="h-10"
                  placeholder="6391304606"
                  inputMode="tel"
                />
              </Field>
              <Field label="Instagram">
                <Input
                  value={form.instagram}
                  onChange={(e) => update("instagram", e.target.value)}
                  className="h-10"
                  placeholder="@a3primestore"
                />
              </Field>
              <Field label="Facebook">
                <Input
                  value={form.facebook}
                  onChange={(e) => update("facebook", e.target.value)}
                  className="h-10"
                  placeholder="facebook.com/a3prime"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Homepage Hero */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home
                className="size-5"
                style={{ color: "var(--brand-blue)" }}
              />
              Homepage Hero
            </CardTitle>
            <CardDescription>
              The first thing customers see on your homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="Hero Title">
              <Input
                value={form.heroTitle}
                onChange={(e) => update("heroTitle", e.target.value)}
                className="h-10"
                placeholder="Fresh Products. Honest Prices."
              />
            </Field>
            <Field label="Hero Subtitle">
              <Textarea
                value={form.heroSubtitle}
                onChange={(e) => update("heroSubtitle", e.target.value)}
                rows={2}
                className="resize-y"
                placeholder="Everything your home needs, delivered with care."
              />
            </Field>
            <Field label="Hero Image" hint="Wide image (recommended 1344×768).">
              <ImageUploader
                value={form.heroImageUrl}
                onChange={(urls) => update("heroImageUrl", urls)}
                token={token}
                max={1}
              />
            </Field>
            <Field label="Announcement" hint="Shown as a small banner above the hero.">
              <Input
                value={form.announcement}
                onChange={(e) => update("announcement", e.target.value)}
                className="h-10"
                placeholder="New stock just in! Visit us today."
              />
            </Field>
            <Field label="Free Shipping Message">
              <Input
                value={form.freeShipMsg}
                onChange={(e) => update("freeShipMsg", e.target.value)}
                className="h-10"
                placeholder="Free local delivery on orders above ₹499"
              />
            </Field>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield
                className="size-5"
                style={{ color: "var(--brand-blue)" }}
              />
              Security
            </CardTitle>
            <CardDescription>
              Change your admin login password.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field
              label="New Admin Password"
              hint="Leave blank to keep current password."
            >
              <Input
                type="password"
                value={form.adminPassword}
                onChange={(e) => update("adminPassword", e.target.value)}
                className="h-10"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900/40 dark:bg-amber-950/30">
              <ImageIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <p className="text-amber-800 dark:text-amber-300">
                After changing the password, you will need to log in again on
                other devices using the new password.
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-lg border bg-emerald-50 p-3 text-sm dark:bg-emerald-950/30">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <p className="text-emerald-800 dark:text-emerald-300">
                Tip: use a strong password with at least 8 characters mixing
                letters and numbers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom save bar */}
      <div className="sticky bottom-4 z-30 flex items-center justify-end gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Don&apos;t forget to save your changes.
        </span>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-10 min-h-11 gap-2 text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-70"
          style={{ backgroundColor: "var(--brand-orange)" }}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save All Changes
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default SettingsForm;
