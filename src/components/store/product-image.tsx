"use client";

import { Package } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
  /** Optional imgClassName to apply only to the rendered <img> (e.g. hover scale). */
  imgClassName?: string;
};

/**
 * Reusable product image with graceful fallback.
 *
 * - If `src` is missing/empty or the <img> fails to load (onError),
 *   a placeholder (Package icon centered on muted bg) is shown instead.
 * - Never shows a broken-image icon.
 * - `className` is applied to BOTH the placeholder wrapper and the <img>,
 *   so callers control sizing (e.g. "h-full w-full" or "size-12 rounded-lg").
 * - `iconClassName` controls the placeholder icon size (e.g. "size-5").
 * - `imgClassName` is appended to the <img> only (e.g. for group-hover:scale-105).
 */
export function ProductImage({
  src,
  alt,
  className,
  iconClassName,
  imgClassName,
}: ProductImageProps) {
  const [error, setError] = useState(false);
  const showPlaceholder = !src || error;

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        <Package className={cn("size-1/3 max-size-10 opacity-50", iconClassName)} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={cn("object-cover", className, imgClassName)}
    />
  );
}

export default ProductImage;
