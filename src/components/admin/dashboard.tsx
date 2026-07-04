"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Tags,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Star,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import type { Product, Category, Order } from "@/lib/types";

type DashboardProps = {
  token: string;
  onNavigate?: (section: string) => void;
};

function formatPrice(p: number): string {
  return `₹${Number.isInteger(p) ? p : p.toFixed(2)}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  delay,
}: {
  icon: typeof Package;
  label: string;
  value: string | number;
  accent: string;
  delay: number;
}) {
  return (
    <Card
      className="card-lift gap-0 overflow-hidden p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span className="text-2xl font-bold text-foreground sm:text-3xl">
            {value}
          </span>
        </div>
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ backgroundColor: accent }}
        >
          <Icon className="size-6" />
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  if (s === "delivered")
    return (
      <Badge className="bg-emerald-600 text-[10px] uppercase text-white hover:bg-emerald-600">
        Delivered
      </Badge>
    );
  if (s === "pending")
    return (
      <Badge
        className="text-[10px] uppercase text-white"
        style={{ backgroundColor: "oklch(0.7 0.18 60)" }}
      >
        Pending
      </Badge>
    );
  if (s === "cancelled")
    return (
      <Badge
        variant="destructive"
        className="text-[10px] uppercase"
      >
        Cancelled
      </Badge>
    );
  if (s === "confirmed")
    return (
      <Badge className="bg-blue-600 text-[10px] uppercase text-white hover:bg-blue-600">
        Confirmed
      </Badge>
    );
  return (
    <Badge variant="secondary" className="text-[10px] uppercase">
      {status || "Unknown"}
    </Badge>
  );
}

export function Dashboard({ token, onNavigate }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ps, cats, os] = await Promise.all([
        api.getProducts({ admin: true }),
        api.getCategories(),
        api.getOrders(token),
      ]);
      setProducts(ps);
      setCategories(cats);
      setOrders([...os].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  // Stats
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalOrders = orders.length;
  const revenue = orders
    .filter(
      (o) =>
        o.status?.toLowerCase() !== "cancelled" &&
        o.status?.toLowerCase() !== "pending"
    )
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Low stock
  const lowStock = products
    .filter((p) => p.stock < 10)
    .sort((a, b) => a.stock - b.stock);

  // Recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  // Featured
  const featured = products.filter((p) => p.featured);

  return (
    <div className="flex flex-col gap-5">
      {/* Welcome banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-lg sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-blue) 0%, oklch(0.4 0.16 268) 60%, oklch(0.5 0.18 260) 100%)",
        }}
      >
        <div
          className="absolute -right-12 -top-12 size-48 rounded-full opacity-20"
          style={{ backgroundColor: "var(--brand-orange)" }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-foreground/80">
              Welcome back, Admin!
            </p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Here&apos;s what&apos;s happening at{" "}
              <span style={{ color: "var(--brand-orange)" }}>A3 Prime Store</span>{" "}
              today.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
              Manage products, fulfill orders, and customize your storefront —
              all from one place.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              onClick={() => onNavigate?.("products")}
              variant="secondary"
              className="gap-2 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
            >
              <Package className="size-4" />
              Manage Products
            </Button>
            <Button
              onClick={() => onNavigate?.("orders")}
              className="gap-2 text-white shadow-sm"
              style={{ backgroundColor: "var(--brand-orange)" }}
            >
              <ShoppingCart className="size-4" />
              View Orders
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/30 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={`sk-${i}`} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="size-12 rounded-xl" />
              </div>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              icon={Package}
              label="Total Products"
              value={totalProducts}
              accent="var(--brand-blue)"
              delay={0}
            />
            <StatCard
              icon={Tags}
              label="Categories"
              value={totalCategories}
              accent="oklch(0.55 0.14 200)"
              delay={60}
            />
            <StatCard
              icon={ShoppingCart}
              label="Total Orders"
              value={totalOrders}
              accent="oklch(0.6 0.13 150)"
              delay={120}
            />
            <StatCard
              icon={IndianRupee}
              label="Revenue"
              value={formatPrice(revenue)}
              accent="var(--brand-orange)"
              delay={180}
            />
          </>
        )}
      </div>

      {/* Secondary row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Low stock alert */}
        <Card className="gap-0 lg:col-span-1">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-5 text-amber-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>
              Products with less than 10 units in stock.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              {loading ? (
                <div className="flex flex-col gap-3 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`sk-ls-${i}`} className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-lg" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                  ))}
                </div>
              ) : lowStock.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
                    <Package className="size-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium">All stocked up!</p>
                  <p className="text-xs text-muted-foreground">
                    No products are running low.
                  </p>
                </div>
              ) : (
                <ul className="divide-y">
                  {lowStock.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
                        {(p.imageUrl || p.images?.[0]) ? (
                          <img
                            src={p.imageUrl || p.images[0]}
                            alt={p.name}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <Package className="size-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="line-clamp-1 text-sm font-medium text-foreground">
                          {p.name}
                        </span>
                        {p.brand && (
                          <span className="text-[11px] text-muted-foreground">
                            {p.brand}
                          </span>
                        )}
                      </div>
                      {p.stock <= 0 ? (
                        <Badge
                          variant="destructive"
                          className="text-[10px] uppercase"
                        >
                          Out
                        </Badge>
                      ) : (
                        <Badge
                          className="text-[10px] uppercase text-white"
                          style={{ backgroundColor: "oklch(0.7 0.18 60)" }}
                        >
                          {p.stock} left
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
            {!loading && lowStock.length > 0 && (
              <div className="border-t p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate?.("products")}
                  className="w-full gap-1.5 text-[var(--brand-blue)]"
                >
                  Manage products
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card className="gap-0 lg:col-span-1">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart
                className="size-5"
                style={{ color: "var(--brand-blue)" }}
              />
              Recent Orders
            </CardTitle>
            <CardDescription>
              The 5 most recent customer orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              {loading ? (
                <div className="flex flex-col gap-3 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`sk-r-${i}`} className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="mt-1.5 h-3 w-16" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <ShoppingCart className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No orders yet</p>
                  <p className="text-xs text-muted-foreground">
                    Orders will show up here once customers start shopping.
                  </p>
                </div>
              ) : (
                <ul className="divide-y">
                  {recentOrders.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="text-xs font-bold">
                          {o.customerName?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2">
                          <span className="line-clamp-1 text-sm font-medium text-foreground">
                            {o.customerName}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(o.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold text-[var(--brand-blue)]">
                          {formatPrice(o.total)}
                        </span>
                        <StatusBadge status={o.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
            {!loading && recentOrders.length > 0 && (
              <div className="border-t p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate?.("orders")}
                  className="w-full gap-1.5 text-[var(--brand-blue)]"
                >
                  View all orders
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured products */}
        <Card className="gap-0 lg:col-span-1">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="size-5 fill-amber-400 text-amber-400" />
              Featured Products
            </CardTitle>
            <CardDescription>
              {loading
                ? "Loading…"
                : `${featured.length} product${featured.length === 1 ? "" : "s"} marked as featured`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              {loading ? (
                <div className="flex flex-col gap-3 p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`sk-f-${i}`} className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-lg" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              ) : featured.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <Star className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No featured products</p>
                  <p className="text-xs text-muted-foreground">
                    Mark products as featured to highlight them on your homepage.
                  </p>
                </div>
              ) : (
                <ul className="divide-y">
                  {featured.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
                        {(p.imageUrl || p.images?.[0]) ? (
                          <img
                            src={p.imageUrl || p.images[0]}
                            alt={p.name}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <Package className="size-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="line-clamp-1 text-sm font-medium text-foreground">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {p.brand || "—"} · {formatPrice(p.price)}
                        </span>
                      </div>
                      <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
            {!loading && featured.length > 0 && (
              <div className="border-t p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate?.("products")}
                  className="w-full gap-1.5 text-[var(--brand-blue)]"
                >
                  Manage products
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer mini-stat */}
      {!loading && (
        <Card className="bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp
              className="size-5 shrink-0"
              style={{ color: "var(--brand-blue)" }}
            />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {totalOrders > 0
                  ? `Average order value: ${formatPrice(
                      revenue /
                        Math.max(
                          1,
                          orders.filter(
                            (o) =>
                              o.status?.toLowerCase() !== "cancelled" &&
                              o.status?.toLowerCase() !== "pending"
                          ).length
                        )
                    )}`
                  : "No paid orders yet — your dashboard will populate once customers start buying."}
              </span>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
