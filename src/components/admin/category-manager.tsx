"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Tags,
  Loader2,
  Save,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { ImageUploader } from "./image-uploader";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICON_SUGGESTIONS = [
  "ShoppingBasket",
  "CupSoda",
  "Cookie",
  "Milk",
  "Sparkles",
  "Home",
  "Apple",
  "Carrot",
  "Coffee",
  "Utensils",
  "Snowflake",
  "Droplets",
  "Bath",
  "Brush",
  "Beef",
  "Egg",
  "Wheat",
  "BottleWine",
  "Beer",
  "IceCreamBowl",
];

type CategoryManagerProps = {
  token: string;
};

type FormState = {
  name: string;
  description: string;
  icon: string;
  imageUrl: string[];
  active: boolean;
};

function emptyForm(): FormState {
  return {
    name: "",
    description: "",
    icon: "ShoppingBasket",
    imageUrl: [],
    active: true,
  };
}

export function CategoryManager({ token }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cs = await api.getCategories();
      setCategories(cs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load categories";
      toast.error("Load failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // React 19 "adjust state during render" pattern for syncing form
  const [prevKey, setPrevKey] = useState<string>("");
  const currentKey = `${editing?.id ?? "new"}-${formOpen ? "open" : "closed"}`;
  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    if (formOpen) {
      setForm(
        editing
          ? {
              name: editing.name || "",
              description: editing.description || "",
              icon: editing.icon || "ShoppingBasket",
              imageUrl: editing.imageUrl ? [editing.imageUrl] : [],
              active: editing.active !== false,
            }
          : emptyForm()
      );
    }
  }

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (c: Category) => {
    setEditing(c);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const imageUrl = form.imageUrl[0] || null;
    const payload: Partial<Category> = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      icon: form.icon.trim() || null,
      imageUrl,
      active: form.active,
    };

    setSaving(true);
    try {
      if (editing) {
        await api.updateCategory(editing.id, payload, token);
        toast.success("Category updated", { description: payload.name });
      } else {
        await api.createCategory(payload, token);
        toast.success("Category created", { description: payload.name });
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save category";
      toast.error("Save failed", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteCategory(deleteId, token);
      toast.success("Category deleted");
      setDeleteId(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      toast.error("Delete failed", { description: msg });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Categories
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : `${categories.length} categor${categories.length === 1 ? "y" : "ies"} · organize your products`}
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="h-10 min-h-11 gap-2 text-white shadow-sm transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: "var(--brand-orange)" }}
        >
          <Plus className="size-4" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`sk-${i}`} className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="size-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-3 w-40" />
                </div>
              </div>
              <Skeleton className="mt-4 h-8 w-full" />
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Tags className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">No categories yet</p>
              <p className="text-xs text-muted-foreground">
                Create categories to organize your products.
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="mt-1 h-10 min-h-11 gap-2 text-white"
              style={{ backgroundColor: "var(--brand-orange)" }}
            >
              <Plus className="size-4" />
              Add your first category
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id} className="gap-0 p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: "var(--brand-blue)" }}
                >
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="size-full rounded-xl object-cover"
                    />
                  ) : (
                    <Tags className="size-6" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-foreground">
                      {c.name}
                    </h3>
                    {c.active ? (
                      <Badge className="bg-emerald-600 text-[10px] uppercase text-white hover:bg-emerald-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase text-muted-foreground"
                      >
                        Hidden
                      </Badge>
                    )}
                  </div>
                  {c.description ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {c.description}
                    </p>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      No description
                    </p>
                  )}
                  {c.icon && (
                    <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                      icon: {c.icon}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(c)}
                  className="h-9 min-h-11 flex-1 gap-1.5"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeleteId(c.id)}
                  className="size-9 min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Delete ${c.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[92vh] gap-0 p-0 sm:max-w-lg">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-lg font-bold">
              {editing ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this category."
                : "Create a new category for your products."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="flex flex-col gap-4 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Beverages"
                  className="h-10"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Optional short description"
                  rows={2}
                  className="resize-y"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Icon</Label>
                <Input
                  value={form.icon}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, icon: e.target.value }))
                  }
                  placeholder="lucide icon name (e.g. ShoppingBasket)"
                  className="h-10 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Pick a suggestion or type any{" "}
                  <a
                    href="https://lucide.dev/icons"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline"
                  >
                    lucide icon name
                  </a>
                  .
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {ICON_SUGGESTIONS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, icon: name }))}
                      className={cn(
                        "rounded-md border px-2 py-1 text-[11px] font-mono transition-colors",
                        form.icon === name
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/40 hover:bg-muted"
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Category Image</Label>
                <ImageUploader
                  value={form.imageUrl}
                  onChange={(urls) =>
                    setForm((f) => ({ ...f, imageUrl: urls }))
                  }
                  token={token}
                  max={1}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 pt-1">
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, active: v }))
                  }
                />
                <span className="flex flex-col">
                  <span className="text-sm font-medium">Active</span>
                  <span className="text-[11px] text-muted-foreground">
                    Visible to customers
                  </span>
                </span>
              </label>
            </div>
          </ScrollArea>

          <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
              className="h-10 min-h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-10 min-h-11 gap-2 text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-70"
              style={{ backgroundColor: "var(--brand-orange)" }}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {editing ? "Save Changes" : "Add Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              The category will be removed. Products in this category will keep
              their category label but won&apos;t appear under any grouped list.
              This cannot be undone.
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
                <>
                  <Package className="size-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CategoryManager;
