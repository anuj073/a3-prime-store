"use client";

import { PackagePlus, Star, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";

type ProductCardProps = {
  product: Product;
  onClick: (p: Product) => void;
  contactPhone?: string;
};

function formatPrice(p: number): string {
  return `₹${Number.isInteger(p) ? p : p.toFixed(2)}`;
}

function discountPct(price: number, original?: number | null): number | null {
  if (!original || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
}

function StarRating({ rating }: { rating: number }) {
  if (!rating || rating <= 0) return null;
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const half = i === full && hasHalf;
        return (
          <Star
            key={i}
            className={cn(
              "size-3",
              filled
                ? "fill-amber-400 text-amber-400"
                : half
                  ? "fill-amber-400/50 text-amber-400"
                  : "fill-muted text-muted-foreground"
            )}
          />
        );
      })}
      <span className="ml-1 text-xs text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function ProductCard({ product, onClick, contactPhone }: ProductCardProps) {
  const addToCart = useStore((s) => s.addToCart);
  const outOfStock = product.stock <= 0;
  const hidePrice = product.showPrice === false;
  const discount = hidePrice
    ? null
    : discountPct(product.price, product.originalPrice);
  const image = product.images?.[0] || product.imageUrl || null;
  const phone = contactPhone || "6391304606";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock || hidePrice) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: image || undefined,
      unit: product.unit || undefined,
      maxStock: product.stock,
    });
    toast.success("Added to cart", {
      description: product.name,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        onClick={() => onClick(product)}
        className="card-lift group relative h-full cursor-pointer gap-0 overflow-hidden rounded-xl border p-0 shadow-sm"
      >
        {/* Image area */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <ProductImage
            src={image}
            alt={product.name}
            className="size-full transition-transform duration-300 group-hover:scale-105"
            iconClassName="size-10 opacity-40"
          />

          {/* Top-left: discount (only when price is shown) */}
          {discount && (
            <Badge
              className="absolute left-2 top-2 gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow"
              style={{ backgroundColor: "var(--brand-orange)" }}
            >
              -{discount}%
            </Badge>
          )}

          {/* Top-left: "Price on Request" pill when price hidden */}
          {hidePrice && (
            <Badge
              className="absolute left-2 top-2 gap-0.5 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow hover:bg-amber-500"
            >
              On Request
            </Badge>
          )}

          {/* Top-right: featured */}
          {product.featured && (
            <Badge
              className="absolute right-2 top-2 gap-0.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow"
            >
              <Star className="size-2.5 fill-current" />
              FEATURED
            </Badge>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
              <Badge
                variant="destructive"
                className="px-3 py-1 text-xs font-bold uppercase tracking-wide"
              >
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
          {product.brand && (
            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </p>
          )}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground">
            {product.name}
          </h3>

          <StarRating rating={product.rating} />

          {hidePrice ? (
            <div className="mt-1">
              <p className="text-sm font-bold text-amber-600">
                Price on Request
              </p>
              <p className="text-[11px] text-muted-foreground">
                Call us for the best price
              </p>
            </div>
          ) : (
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[var(--brand-blue)]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.unit && (
                <span className="text-xs text-muted-foreground">
                  / {product.unit}
                </span>
              )}
            </div>
          )}

          {/* Stock hint */}
          {!outOfStock && product.stock <= 5 && (
            <p className="text-[11px] font-medium text-amber-600">
              Only {product.stock} left
            </p>
          )}

          {hidePrice ? (
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: "var(--brand-blue)" }}
              aria-label={`Call to order ${product.name}`}
            >
              <Phone className="size-4" />
              Call to Order
            </a>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="mt-2 h-9 w-full gap-1.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-50"
              style={{ backgroundColor: "var(--brand-orange)" }}
              aria-label={`Add ${product.name} to cart`}
            >
              <PackagePlus className="size-4" />
              {outOfStock ? "Sold Out" : "Add to Cart"}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export default ProductCard;
