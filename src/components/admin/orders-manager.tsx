"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShoppingCart,
  IndianRupee,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  StickyNote,
  XCircle,
  Package,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

type OrdersManagerProps = {
  token: string;
};

const STATUS_STYLES: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500 text-white hover:bg-amber-500",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    className:
      "bg-blue-600 text-white hover:bg-blue-600",
    icon: CheckCircle2,
  },
  delivered: {
    label: "Delivered",
    className:
      "bg-emerald-600 text-white hover:bg-emerald-600",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-destructive text-white hover:bg-destructive",
    icon: XCircle,
  },
};

function getStatusMeta(status: string) {
  return (
    STATUS_STYLES[status?.toLowerCase()] || {
      label: status || "Unknown",
      className: "bg-secondary text-secondary-foreground",
      icon: Package,
    }
  );
}

function formatPrice(p: number): string {
  return `₹${Number.isInteger(p) ? p : p.toFixed(2)}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ backgroundColor: accent }}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span className="truncate text-2xl font-bold text-foreground">
            {value}
          </span>
        </div>
      </div>
    </Card>
  );
}

export function OrdersManager({ token }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("__all__");
  const [selected, setSelected] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const os = await api.getOrders(token);
      // newest first
      setOrders([...os].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load orders";
      toast.error("Load failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    statusFilter === "__all__"
      ? orders
      : orders.filter(
          (o) => o.status?.toLowerCase() === statusFilter.toLowerCase()
        );

  const total = orders.length;
  const pending = orders.filter(
    (o) => o.status?.toLowerCase() === "pending"
  ).length;
  const delivered = orders.filter(
    (o) => o.status?.toLowerCase() === "delivered"
  ).length;
  const revenue = orders
    .filter(
      (o) =>
        o.status?.toLowerCase() !== "cancelled" &&
        o.status?.toLowerCase() !== "pending"
    )
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Orders</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {loading
            ? "Loading…"
            : `${orders.length} order${orders.length === 1 ? "" : "s"} received`}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={`sk-${i}`} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-11 rounded-xl" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              icon={ShoppingCart}
              label="Total Orders"
              value={total}
              accent="var(--brand-blue)"
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={pending}
              accent="oklch(0.7 0.18 60)"
            />
            <StatCard
              icon={CheckCircle2}
              label="Delivered"
              value={delivered}
              accent="oklch(0.6 0.13 150)"
            />
            <StatCard
              icon={IndianRupee}
              label="Revenue"
              value={formatPrice(revenue)}
              accent="var(--brand-orange)"
            />
          </>
        )}
      </div>

      {/* Filter */}
      <Card className="gap-0 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Filter orders by status
          </p>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full sm:w-56">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="gap-0 overflow-hidden p-0">
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-48">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <ShoppingCart className="size-7 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">No orders yet</p>
                        <p className="text-xs text-muted-foreground">
                          {statusFilter !== "__all__"
                            ? "No orders match this filter."
                            : "Orders placed by customers will appear here."}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((o) => {
                  const meta = getStatusMeta(o.status);
                  const itemsCount = Array.isArray(o.items)
                    ? o.items.reduce((s, it) => s + (it.quantity || 0), 0)
                    : 0;
                  return (
                    <TableRow
                      key={o.id}
                      onClick={() => setSelected(o)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {o.orderNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="line-clamp-1 text-sm font-medium text-foreground">
                            {o.customerName}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {o.customerPhone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm">{itemsCount}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-[var(--brand-blue)]">
                          {formatPrice(o.total)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "gap-1 text-[11px] font-semibold uppercase",
                            meta.className
                          )}
                        >
                          <meta.icon className="size-3" />
                          {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {formatDate(o.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Order detail dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <DialogContent className="max-h-[92vh] gap-0 p-0 sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader className="border-b px-6 py-4">
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  Order{" "}
                  <span className="font-mono text-[var(--brand-blue)]">
                    {selected.orderNumber}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Placed on {formatDate(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh]">
                <div className="flex flex-col gap-5 px-6 py-5">
                  {/* Status */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Status
                    </span>
                    {(() => {
                      const meta = getStatusMeta(selected.status);
                      return (
                        <Badge
                          className={cn(
                            "gap-1 text-xs font-semibold uppercase",
                            meta.className
                          )}
                        >
                          <meta.icon className="size-3" />
                          {meta.label}
                        </Badge>
                      );
                    })()}
                  </div>

                  {/* Customer */}
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Customer
                    </p>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {selected.customerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground" />
                        <a
                          href={`tel:${selected.customerPhone}`}
                          className="font-medium text-[var(--brand-blue)] hover:underline"
                        >
                          {selected.customerPhone}
                        </a>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <span className="text-foreground">
                          {selected.customerAddress}
                        </span>
                      </div>
                      {selected.customerNote && (
                        <div className="flex items-start gap-2">
                          <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <span className="italic text-muted-foreground">
                            &ldquo;{selected.customerNote}&rdquo;
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Items ({selected.items?.length || 0})
                    </p>
                    <div className="flex flex-col gap-2">
                      {selected.items?.map((it, idx) => (
                        <div
                          key={`${it.productId}-${idx}`}
                          className="flex items-center gap-3 rounded-lg border bg-card p-3"
                        >
                          <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                            {it.imageUrl ? (
                              <img
                                src={it.imageUrl}
                                alt={it.name}
                                className="size-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-muted-foreground">
                                <Package className="size-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="line-clamp-1 text-sm font-medium text-foreground">
                              {it.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatPrice(it.price)} × {it.quantity}
                              {it.unit ? ` / ${it.unit}` : ""}
                            </span>
                          </div>
                          <span className="font-semibold text-foreground">
                            {formatPrice(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="flex flex-col gap-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">
                          {formatPrice(selected.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Delivery
                        </span>
                        <span className="font-medium">
                          {selected.deliveryCharge === 0
                            ? "FREE"
                            : formatPrice(selected.deliveryCharge)}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between border-t pt-2">
                        <span className="font-semibold">Total</span>
                        <span className="text-lg font-bold text-[var(--brand-blue)]">
                          {formatPrice(selected.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => setSelected(null)}
                  className="h-10 min-h-11"
                >
                  Close
                </Button>
                <a href={`tel:${selected.customerPhone}`}>
                  <Button
                    className="h-10 min-h-11 gap-2 text-white shadow-sm transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: "var(--brand-orange)" }}
                  >
                    <Phone className="size-4" />
                    Call Customer
                  </Button>
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrdersManager;
