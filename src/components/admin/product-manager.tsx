"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Loader2,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductFormDialog } from "./product-form-dialog";
import { ProductImage } from "@/components/store/product-image";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Product, Category } from "@/lib/types";

function formatPrice(p: number): string {
  return `₹${Number.isInteger(p) ? p : p.toFixed(2)}`;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <Badge
        variant="destructive"
        className="gap-1 text-[11px] font-semibold uppercase"
      >
        <AlertTriangle className="size-3" />
        Out
      </Badge>
    );
  }
  if (stock < 10) {
    return (
      <Badge
        className="gap-1 bg-amber-500 text-[11px] font-semibold uppercase text-white hover:bg-amber-500"
        style={{ backgroundColor: "oklch(0.7 0.18 60)" }}
      >
        Low · {stock}
      </Badge>
    );
  }
  return (
    <Badge
      className="gap-1 bg-emerald-600 text-[11px] font-semibold uppercase text-white hover:bg-emerald-600"
    >
      In Stock · {stock}
    </Badge>
  );
}

type ProductManagerProps = {
  token: string;
};

export function ProductManager({ token }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("__all__");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ps, cats] = await Promise.all([
        api.getProducts({ admin: true }),
        api.getCategories(),
      ]);
      setProducts(ps);
      setCategories(cats);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
      toast.error("Load failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteProduct(deleteId, token);
      toast.success("Product deleted");
      setDeleteId(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      toast.error("Delete failed", { description: msg });
    } finally {
      setDeleting(false);
    }
  };

  // Client-side filtering
  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q);
    const matchesCat =
      categoryFilter === "__all__" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Products
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : `${products.length} product${products.length === 1 ? "" : "s"} in your store`}
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="h-10 min-h-11 gap-2 text-white shadow-sm transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: "var(--brand-orange)" }}
        >
          <Plus className="size-4" />
          Add Product
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="gap-0 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or brand…"
              className="h-10 pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="h-10 w-full sm:w-56">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
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
                <TableHead className="w-14">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell text-center">
                  Featured
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell>
                      <Skeleton className="size-12 rounded-lg" />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="mx-auto h-4 w-4" />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Skeleton className="size-8 rounded-md" />
                        <Skeleton className="size-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="h-48">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Package className="size-7 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">No products yet</p>
                        <p className="text-xs text-muted-foreground">
                          {search || categoryFilter !== "__all__"
                            ? "Try adjusting your search or filters."
                            : "Add your first product to get started."}
                        </p>
                      </div>
                      {!search && categoryFilter === "__all__" && (
                        <Button
                          onClick={handleAdd}
                          className="mt-1 h-10 min-h-11 gap-2 text-white"
                          style={{ backgroundColor: "var(--brand-orange)" }}
                        >
                          <Plus className="size-4" />
                          Add your first product
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const img = p.images?.[0] || p.imageUrl || null;
                  const hidePrice = p.showPrice === false;
                  return (
                    <TableRow key={p.id} className="group">
                      <TableCell>
                        <div className="size-12 overflow-hidden rounded-lg border bg-muted">
                          <ProductImage
                            src={img}
                            alt={p.name}
                            className="size-full"
                            iconClassName="size-5 opacity-40"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="line-clamp-1 font-medium text-foreground">
                            {p.name}
                          </span>
                          {p.brand && (
                            <span className="text-[11px] text-muted-foreground">
                              {p.brand}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.category ? (
                          <Badge variant="secondary" className="font-medium">
                            {p.category}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hidePrice ? (
                          <div className="flex flex-col">
                            <Badge
                              className="w-fit gap-1 bg-amber-500 text-[10px] uppercase text-white hover:bg-amber-500"
                            >
                              On Request
                            </Badge>
                            <span className="mt-0.5 text-[11px] text-muted-foreground">
                              Price hidden
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-semibold text-[var(--brand-blue)]">
                              {formatPrice(p.price)}
                            </span>
                            {p.originalPrice && p.originalPrice > p.price && (
                              <span className="text-[11px] text-muted-foreground line-through">
                                {formatPrice(p.originalPrice)}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <StockBadge stock={p.stock} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {p.active ? (
                          <Badge className="bg-emerald-600 text-[11px] uppercase text-white hover:bg-emerald-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[11px] uppercase text-muted-foreground"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-center">
                        {p.featured ? (
                          <Star className="mx-auto size-4 fill-amber-400 text-amber-400" />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleEdit(p)}
                            aria-label={`Edit ${p.name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteId(p.id)}
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        categories={categories}
        token={token}
        onSaved={load}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently
              removed from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProductManager;
