"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingCart, Shield, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "./brand-logo";
import { useStore } from "@/lib/store";
import type { StoreSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

type StoreHeaderProps = {
  settings: StoreSettings | null;
  onSearchChange: (q: string) => void;
  searchValue: string;
};

export function StoreHeader({
  settings,
  onSearchChange,
  searchValue,
}: StoreHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const cart = useStore((s) => s.cart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setView = useStore((s) => s.setView);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleLogoClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        {/* Left: Logo */}
        <button
          onClick={handleLogoClick}
          className="flex shrink-0 items-center"
          aria-label="A3 Prime Store home"
        >
          <div className="hidden sm:block">
            <BrandLogo size="md" settings={settings} />
          </div>
          <div className="sm:hidden">
            <BrandLogo size="sm" settings={settings} showText={false} />
          </div>
        </button>

        {/* Center: Search (desktop) */}
        <div className="relative hidden flex-1 max-w-xl md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for products, brands..."
            className="h-10 pl-9 pr-3"
            aria-label="Search products"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="size-10"
            aria-label="Toggle theme"
          >
            {mounted &&
              (theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              ))}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="size-10 md:hidden"
            aria-label="Toggle search"
          >
            {mobileSearchOpen ? (
              <X className="size-5" />
            ) : (
              <Search className="size-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setView("admin")}
            className="hidden h-10 gap-2 px-3 sm:flex"
            aria-label="Open admin panel"
          >
            <Shield className="size-4" />
            <span className="text-sm">Admin</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView("admin")}
            className="size-10 sm:hidden"
            aria-label="Open admin panel"
          >
            <Shield className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCartOpen(true)}
            className="relative size-10"
            aria-label={`Open cart with ${cartCount} items`}
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <Badge
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: "var(--brand-orange)" }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile search drawer */}
      <div
        className={cn(
          "overflow-hidden border-t bg-background/95 backdrop-blur-md transition-all md:hidden",
          mobileSearchOpen ? "max-h-20 py-3" : "max-h-0"
        )}
      >
        <div className="mx-auto max-w-7xl px-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, brands..."
              className="h-10 pl-9 pr-3"
              autoFocus={mobileSearchOpen}
              aria-label="Search products"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default StoreHeader;
