"use client";

import { Package, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
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
 * Reusable product image with graceful, self-healing fallback.
 *
 * - If `src` is missing/empty or the <img> fails to load (onError),
 *   a placeholder (Package icon centered on muted bg) is shown instead.
 * - Never shows a broken-image icon.
 * - When `src` changes, the error state resets so the new image gets a
 *   fresh chance to load (fixes permanently-stuck placeholders).
 * - If an image with a valid `src` fails, it auto-retries once after a
 *   short delay, and the placeholder becomes click-to-retry.
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
  const [retryKey, setRetryKey] = useState(0);
  const [autoRetried, setAutoRetried] = useState(false);
  // Track the previous src so we can reset the error state when it changes.
  const [prevSrc, setPrevSrc] = useState(src);

  // Reset error state whenever the src changes (new image gets a fresh chance).
  if (prevSrc !== src) {
    setPrevSrc(src);
    setError(false);
    setAutoRetried(false);
    setRetryKey((k) => k + 1);
  }

  // Auto-retry once after a short delay if the image fails (handles transient
  // load failures, e.g. during upload while the file is being written).
  useEffect(() => {
    if (error && src && !autoRetried) {
      const t = setTimeout(() => {
        setAutoRetried(true);
        setRetryKey((k) => k + 1);
        setError(false);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [error, src, autoRetried]);

  const showPlaceholder = !src || error;

  const handleRetry = () => {
    if (!src) return;
    setError(false);
    setRetryKey((k) => k + 1);
  };

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          src && "cursor-pointer",
          className
        )}
        onClick={src ? handleRetry : undefined}
        title={src ? "Click to retry loading image" : undefined}
      >
        {src && autoRetried ? (
          // After an auto-retry has already happened, show a retry hint
          // so the user knows they can click to try again.
          <RefreshCw className={cn("size-6 opacity-50", iconClassName)} />
        ) : (
          <Package className={cn("size-10 max-size-12 opacity-50", iconClassName)} />
        )}
      </div>
    );
  }

  return (
    <img
      key={retryKey}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={cn("object-cover", className, imgClassName)}
    />
  );
}

export default ProductImage;
