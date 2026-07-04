"use client";

import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/lib/types";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  settings?: StoreSettings | null;
  className?: string;
};

const sizeMap = {
  sm: { box: "h-8 w-8", text: "text-sm", title: "text-base", subtitle: "text-xs" },
  md: { box: "h-10 w-10", text: "text-base", title: "text-lg", subtitle: "text-sm" },
  lg: { box: "h-14 w-14", text: "text-xl", title: "text-2xl", subtitle: "text-base" },
};

export function BrandLogo({
  size = "md",
  showText = true,
  settings,
  className,
}: BrandLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {settings?.logoUrl ? (
        <img
          src={settings.logoUrl}
          alt={settings.storeName || "A3 Prime Store"}
          className={cn("rounded-lg object-cover shadow-sm", s.box)}
        />
      ) : (
        <div
          className={cn(
            "brand-gradient-bg flex items-center justify-center rounded-lg font-extrabold text-white shadow-md",
            s.box,
            s.text
          )}
          aria-hidden="true"
        >
          A3
        </div>
      )}

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-extrabold tracking-tight",
              s.title,
              "text-[var(--brand-blue)]"
            )}
          >
            A3 Prime
            <span className="ml-1 text-[var(--brand-orange)]">Store</span>
          </span>
          <span
            className={cn(
              "mt-0.5 font-medium text-muted-foreground",
              s.subtitle
            )}
          >
            {settings?.tagline || "Fresh Products. Honest Prices."}
          </span>
        </div>
      )}
    </div>
  );
}

export default BrandLogo;
