"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StoreHeader } from "./header";
import { Hero } from "./hero";
import { CategoryBar } from "./category-bar";
import { ProductGrid } from "./product-grid";
import { ProductModal } from "./product-modal";
import { CartDrawer } from "./cart-drawer";
import { CheckoutModal } from "./checkout-modal";
import { StoreFooter } from "./footer";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Product, Category, StoreSettings } from "@/lib/types";

export function StoreFront() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const setCartOpen = useStore((s) => s.setCartOpen);

  // Refs to hold latest values for the debounce timer
  const searchRef = useRef(search);
  searchRef.current = search;

  // Load settings + categories once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, c] = await Promise.all([
          api.getSettings(),
          api.getCategories(),
        ]);
        if (!cancelled) {
          setSettings(s);
          setCategories(c);
        }
      } catch (err) {
        console.error("Failed to load store settings/categories:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load products with debounce on search change; immediate on category change
  useEffect(() => {
    let cancelled = false;
    setLoadingProducts(true);

    const fetchProducts = async () => {
      try {
        const params: { category?: string; search?: string } = {};
        if (category && category !== "all") params.category = category;
        const q = searchRef.current.trim();
        if (q) params.search = q;
        const data = await api.getProducts(params);
        if (!cancelled) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    const timer = setTimeout(fetchProducts, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category, search]);

  const handleProductClick = useCallback((p: Product) => {
    setSelectedProduct(p);
    setProductModalOpen(true);
  }, []);

  const handleCheckout = useCallback(() => {
    setCartOpen(false);
    setTimeout(() => setCheckoutOpen(true), 200);
  }, [setCartOpen]);

  const handleOrderPlaced = useCallback(() => {
    setCheckoutOpen(false);
    setSelectedProduct(null);
    setProductModalOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader
        settings={settings}
        onSearchChange={setSearch}
        searchValue={search}
      />

      <main className="flex-1">
        {settings && <Hero settings={settings} />}

        <section
          id="products-section"
          className="mx-auto w-full max-w-7xl scroll-mt-32 px-3 py-8 sm:px-6"
        >
          <CategoryBar
            categories={categories}
            selected={category}
            onSelect={setCategory}
          />

          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Our Products
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {loadingProducts
                  ? "Loading products..."
                  : `${products.length} ${products.length === 1 ? "product" : "products"} found`}
                {search.trim() && (
                  <>
                    {" "}for &ldquo;<span className="font-medium text-foreground">{search.trim()}</span>&rdquo;
                  </>
                )}
              </p>
            </div>
          </div>

          <ProductGrid
            products={products}
            loading={loadingProducts}
            onProductClick={handleProductClick}
          />
        </section>
      </main>

      {settings && <StoreFooter settings={settings} />}

      {/* Overlays */}
      <ProductModal
        product={selectedProduct}
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
      />
      <CartDrawer onCheckout={handleCheckout} />
      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onPlaced={handleOrderPlaced}
      />
    </div>
  );
}

export default StoreFront;
