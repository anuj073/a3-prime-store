"use client";

import { PackageSearch } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./product-card";
import type { Product } from "@/lib/types";

type ProductGridProps = {
  products: Product[];
  loading: boolean;
  onProductClick: (p: Product) => void;
  contactPhone?: string;
};

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3 sm:p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="mt-2 h-9 w-full" />
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  loading,
  onProductClick,
  contactPhone,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-4 py-16 text-center sm:py-24">
        <div className="flex size-16 items-center justify-center rounded-full bg-background shadow-sm">
          <PackageSearch className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          No products found
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t find any products matching your search. Try a
          different keyword or browse all categories.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onProductClick}
          contactPhone={contactPhone}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
