"use client";

import { useMemo, useState } from "react";
import {
  Minus,
  Plus,
  PackagePlus,
  ShoppingCart,
  Star,
  Check,
  Truck,
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";

type ProductModalProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contactPhone?: string;
};

function formatPrice(p: number): string {
  return `₹${Number.isInteger(p) ? p : p.toFixed(2)}`;
}

export function ProductModal({
  product,
  open,
  onOpenChange,
  contactPhone,
}: ProductModalProps) {
  const addToCart = useStore((s) => s.addToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const images = useMemo<string[]>(() => {
    if (!product) return [];
    return product.images?.length
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  }, [product]);

  // Reset state during render when the product changes (avoids setState-in-effect).
  const [prevProductId, setPrevProductId] = useState<string | null>(null);
  const [prevImageKey, setPrevImageKey] = useState<string>("");
  const imageKey = images.join("|");
  if (product && product.id !== prevProductId) {
    setPrevProductId(product.id);
    setQty(1);
    setActiveImage(images[0] || null);
    setPrevImageKey(imageKey);
  } else if (!product && prevProductId !== null) {
    setPrevProductId(null);
    setActiveImage(null);
    setPrevImageKey("");
  } else if (
    product &&
    imageKey !== prevImageKey &&
    (!activeImage || !images.includes(activeImage))
  ) {
    setPrevImageKey(imageKey);
    setActiveImage(images[0] || null);
  }

  if (!product) return null;

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const hidePrice = product.showPrice === false;
  const phone = contactPhone || "6391304606";
  const discount =
    !hidePrice &&
    product.originalPrice &&
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : null;

  const handleAddToCart = () => {
    if (outOfStock || hidePrice) return;
    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: activeImage || undefined,
        unit: product.unit || undefined,
        maxStock: product.stock,
      },
      qty
    );
    toast.success("Added to cart", {
      description: `${qty} × ${product.name}`,
    });
  };

  const handleBuyNow = () => {
    if (outOfStock || hidePrice) return;
    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: activeImage || undefined,
        unit: product.unit || undefined,
        maxStock: product.stock,
      },
      qty
    );
    onOpenChange(false);
    setTimeout(() => setCartOpen(true), 200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-4xl scrollbar-thin"
        showCloseButton
      >
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Product details for {product.name}
        </DialogDescription>

        <div className="grid gap-0 md:grid-cols-2">
          {/* Image column */}
          <div className="flex flex-col gap-3 border-b p-4 md:border-b-0 md:border-r">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
              <ProductImage
                src={activeImage}
                alt={product.name}
                className="size-full"
                iconClassName="size-16 opacity-40"
              />
              {discount && (
                <Badge
                  className="absolute left-3 top-3 gap-0.5 px-2 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--brand-orange)" }}
                >
                  -{discount}% OFF
                </Badge>
              )}
              {hidePrice && (
                <Badge
                  className="absolute left-3 top-3 gap-0.5 bg-amber-500 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white hover:bg-amber-500"
                >
                  Price on Request
                </Badge>
              )}
              {product.featured && (
                <Badge className="absolute right-3 top-3 gap-0.5 bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                  <Star className="size-3 fill-current" />
                  Featured
                </Badge>
              )}
            </div>

            {images.length > 1 && (
              <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-all",
                      activeImage === img
                        ? "border-primary"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                    aria-label={`View image ${i + 1}`}
                  >
                    <ProductImage
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="size-full"
                      iconClassName="size-5 opacity-40"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details column */}
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              {product.brand && (
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-orange)]">
                  {product.brand}
                </span>
              )}
              <h2 className="text-2xl font-bold leading-tight text-foreground">
                {product.name}
              </h2>
              {product.rating > 0 && (
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-4",
                          i < Math.floor(product.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating.toFixed(1)} rating
                  </span>
                </div>
              )}
            </div>

            {/* Price block */}
            {hidePrice ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
                <p className="text-2xl font-extrabold text-amber-600">
                  Price on Request
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  Call us at{" "}
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="font-semibold underline underline-offset-2"
                  >
                    {phone}
                  </a>{" "}
                  to know the price and place your order.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[var(--brand-blue)]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-base text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <Badge
                        className="px-2 py-0.5 text-xs font-bold text-white"
                        style={{ backgroundColor: "var(--brand-orange)" }}
                      >
                        Save {formatPrice(product.originalPrice - product.price)}
                      </Badge>
                    </>
                  )}
                {product.unit && (
                  <span className="text-sm text-muted-foreground">
                    / {product.unit}
                  </span>
                )}
              </div>
            )}

            {/* Stock status */}
            <div>
              {outOfStock ? (
                <Badge variant="destructive" className="gap-1">
                  Out of Stock
                </Badge>
              ) : lowStock ? (
                <Badge className="gap-1 bg-amber-500 text-white hover:bg-amber-500">
                  <Truck className="size-3" />
                  Low Stock — only {product.stock} left
                </Badge>
              ) : (
                <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
                  <Check className="size-3" />
                  In Stock
                </Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity selector (only when priced) */}
            {!hidePrice && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  Quantity:
                </span>
                <div className="flex items-center gap-1 rounded-lg border">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={outOfStock || qty <= 1}
                    className="flex size-9 items-center justify-center rounded-l-lg text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span
                    className="min-w-10 text-center text-sm font-semibold"
                    aria-live="polite"
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={outOfStock || qty >= product.stock}
                    className="flex size-9 items-center justify-center rounded-r-lg text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                {!outOfStock && (
                  <span className="text-xs text-muted-foreground">
                    Max {product.stock}
                  </span>
                )}
              </div>
            )}

            {/* CTA buttons */}
            {hidePrice ? (
              <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md text-base font-semibold text-white shadow-sm transition-transform hover:scale-[1.01]"
                  style={{ backgroundColor: "var(--brand-blue)" }}
                >
                  <Phone className="size-5" />
                  Call to Order
                </a>
              </div>
            ) : (
              <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
                <Button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="h-12 flex-1 gap-2 text-base font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-50"
                  style={{ backgroundColor: "var(--brand-orange)" }}
                >
                  <PackagePlus className="size-5" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                  variant="default"
                  className="h-12 flex-1 gap-2 text-base font-semibold shadow-sm"
                >
                  <ShoppingCart className="size-5" />
                  Buy Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductModal;
