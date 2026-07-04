"use client";

import {
  Phone,
  MapPin,
  Clock,
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  Shield,
  Truck,
  Wallet,
} from "lucide-react";
import type { StoreSettings } from "@/lib/types";
import { BrandLogo } from "./brand-logo";

type StoreFooterProps = {
  settings: StoreSettings;
};

export function StoreFooter({ settings }: StoreFooterProps) {
  const year = new Date().getFullYear();
  const storeName = settings.storeName || "A3 Prime Store";
  const phone = settings.phone || "6391304606";
  const address = settings.address || "Bazar Neorhia, Jaunpur - 222128, Uttar Pradesh";
  const ownerName = settings.ownerName || "Akash Maurya";

  const scrollToProducts = () => {
    const el = document.getElementById("products-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer
      className="mt-auto w-full text-primary-foreground"
      style={{ backgroundColor: "var(--brand-blue)" }}
    >
      {/* Top promise strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-4">
          {[
            { icon: Truck, title: "Fast Local Delivery", desc: "Same-day in Jaunpur" },
            { icon: Wallet, title: "Honest Pricing", desc: "No hidden charges" },
            { icon: Shield, title: "Trusted Brands", desc: "Quality guaranteed" },
            { icon: Phone, title: "Call & Order", desc: phone },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex items-center gap-3 text-white"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="truncate text-xs text-white/70">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Col 1: Brand */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg bg-white/95 p-2">
            <BrandLogo size="md" settings={settings} />
          </div>
          <p className="text-sm text-white/80">
            {settings.tagline || "Your Trusted Neighborhood Store"}
          </p>
          <div className="flex items-start gap-2 text-sm text-white/80">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>{address}</span>
          </div>
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 text-sm font-medium text-white hover:text-[var(--brand-orange)]"
          >
            <Phone className="size-4" />
            {phone}
          </a>
        </div>

        {/* Col 2: Shop */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">
            Shop
          </h4>
          <ul className="flex flex-col gap-2 text-sm text-white/80">
            <li>
              <button
                onClick={scrollToProducts}
                className="text-left hover:text-[var(--brand-orange)]"
              >
                All Products
              </button>
            </li>
            <li>
              <button
                onClick={scrollToProducts}
                className="text-left hover:text-[var(--brand-orange)]"
              >
                Groceries
              </button>
            </li>
            <li>
              <button
                onClick={scrollToProducts}
                className="text-left hover:text-[var(--brand-orange)]"
              >
                Dairy &amp; Beverages
              </button>
            </li>
            <li>
              <button
                onClick={scrollToProducts}
                className="text-left hover:text-[var(--brand-orange)]"
              >
                Home Care
              </button>
            </li>
            <li>
              <button
                onClick={scrollToProducts}
                className="text-left hover:text-[var(--brand-orange)]"
              >
                Personal Care
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">
            Contact
          </h4>
          <ul className="flex flex-col gap-2 text-sm text-white/80">
            <li>
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 hover:text-[var(--brand-orange)]"
              >
                <Phone className="size-4" />
                {phone}
              </a>
            </li>
            {settings.email && (
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2 hover:text-[var(--brand-orange)]"
                >
                  <Mail className="size-4" />
                  {settings.email}
                </a>
              </li>
            )}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{address}</span>
            </li>
          </ul>
          {/* Social */}
          <div className="mt-1 flex gap-2">
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-[var(--brand-orange)]"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="size-4" />
              </a>
            )}
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-[var(--brand-orange)]"
                aria-label="Visit Instagram"
              >
                <Instagram className="size-4" />
              </a>
            )}
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-[var(--brand-orange)]"
                aria-label="Visit Facebook"
              >
                <Facebook className="size-4" />
              </a>
            )}
            {!settings.whatsapp &&
              !settings.instagram &&
              !settings.facebook && (
                <a
                  href={`https://wa.me/91${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-[var(--brand-orange)]"
                  aria-label="Chat on WhatsApp"
                >
                  <MessageCircle className="size-4" />
                </a>
              )}
          </div>
        </div>

        {/* Col 4: Hours */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">
            Store Hours
          </h4>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Clock className="size-4 shrink-0" />
            <div>
              <p className="font-medium text-white">Open Daily</p>
              <p>7:00 AM – 10:00 PM</p>
            </div>
          </div>
          <div className="mt-2 rounded-lg bg-white/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-orange)]">
              Owned by
            </p>
            <p className="mt-0.5 text-sm font-bold text-white">{ownerName}</p>
            <p className="text-xs text-white/70">Bazar Neorhia, Jaunpur</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-white/70 sm:flex-row sm:px-6 sm:text-left">
          <p>
            © {year} {storeName}. Owned by {ownerName}. All rights reserved.
          </p>
          <p>Powered with care for our neighborhood.</p>
        </div>
      </div>
    </footer>
  );
}

export default StoreFooter;
