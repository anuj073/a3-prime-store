"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageUploader } from "./image-uploader";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Product, Category } from "@/lib/types";

const UNIT_OPTIONS = [
  "pack",
  "kg",
  "bottle",
  "pouch",
  "bar",
  "tube",
  "jar",
  "pcs",
  "liter",
  "gram",
  "box",
] as const;

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: Product | null;
  categories: Category[];
  token: string;
  onSaved: () => void;
};

type FormState = {
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  originalPrice: string;
  stock: string;
  unit: string;
  rating: string;
  featured: boolean;
  active: boolean;
  images: string[];
};

function emptyForm(): FormState {
  return {
    name: "",
    brand: "",
    category: "__none__",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    unit: "pack",
    rating: "0",
    featured: false,
    active: true,
    images: [],
  };
}

function fromProduct(p: Product): FormState {
  const images = p.images && p.images.length > 0 ? [...p.images] : p.imageUrl ? [p.imageUrl] : [];
  return {
    name: p.name || "",
    brand: p.brand || "",
    category: p.category || "__none__",
    description: p.description || "",
    price: String(p.price ?? ""),
    originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
    stock: String(p.stock ?? 0),
    unit: p.unit || "pack",
    rating: String(p.rating ?? 0),
    featured: !!p.featured,
    active: p.active !== false,
    images,
  };
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  token,
  onSaved,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form whenever product or open state changes.
  // Using the React 19 "adjust state during render" pattern: track previous
  // key and reset when it changes (avoids setState-in-effect lint issue).
  const [prevKey, setPrevKey] = useState<string>("");
  const currentKey = `${product?.id ?? "new"}-${open ? "open" : "closed"}`;
  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    setForm(open ? (product ? fromProduct(product) : emptyForm()) : emptyForm());
    setErrors({});
  }

  const update = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key as string]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as string];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = "Enter a valid price";
    if (
      form.originalPrice.trim() &&
      (isNaN(Number(form.originalPrice)) || Number(form.originalPrice) < 0)
    )
      e.originalPrice = "Enter a valid original price";
    if (form.stock.trim() === "" || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = "Enter valid stock";
    const ratingNum = Number(form.rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5)
      e.rating = "Rating must be between 0 and 5";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const imageUrl = form.images[0] || null;
    const payload: Partial<Product> = {
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      category: form.category === "__none__" ? null : form.category,
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice.trim()
        ? Number(form.originalPrice)
        : null,
      stock: Math.max(0, Math.floor(Number(form.stock))),
      unit: form.unit,
      rating: Number(form.rating),
      featured: form.featured,
      active: form.active,
      images: form.images,
      imageUrl,
    };

    setSaving(true);
    try {
      if (product) {
        await api.updateProduct(product.id, payload, token);
        toast.success("Product updated", {
          description: payload.name,
        });
      } else {
        await api.createProduct(payload, token);
        toast.success("Product created", {
          description: payload.name,
        });
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save product";
      toast.error("Save failed", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-lg font-bold">
            {product ? "Edit Product" : "Add Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update the product details below."
              : "Fill in the details to add a new product to your store."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="flex flex-col gap-5 px-6 py-5">
            {/* Basic info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required error={errors.name}>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Parle-G Biscuit 100g"
                  className="h-10"
                />
              </Field>
              <Field label="Brand">
                <Input
                  value={form.brand}
                  onChange={(e) => update("brand", e.target.value)}
                  placeholder="e.g. Parle"
                  className="h-10"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <Select
                  value={form.category}
                  onValueChange={(v) => update("category", v)}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Unit">
                <Select
                  value={form.unit}
                  onValueChange={(v) => update("unit", v)}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Description" required error={errors.description}>
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe the product — what it is, key features, packaging, etc."
                rows={4}
                className="resize-y"
              />
            </Field>

            {/* Pricing & stock */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Price (₹)" required error={errors.price}>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="0"
                  className="h-10"
                />
              </Field>
              <Field label="Original Price (₹)" error={errors.originalPrice}>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={form.originalPrice}
                  onChange={(e) => update("originalPrice", e.target.value)}
                  placeholder="Optional"
                  className="h-10"
                />
              </Field>
              <Field label="Stock" required error={errors.stock}>
                <Input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  placeholder="0"
                  className="h-10"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Rating (0–5)" error={errors.rating}>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={(e) => update("rating", e.target.value)}
                  className="h-10"
                />
              </Field>
              <div className="flex items-end gap-6 pb-1">
                <SwitchRow
                  label="Featured"
                  description="Show on home page"
                  checked={form.featured}
                  onChange={(v) => update("featured", v)}
                />
                <SwitchRow
                  label="Active"
                  description="Visible in store"
                  checked={form.active}
                  onChange={(v) => update("active", v)}
                />
              </div>
            </div>

            {/* Images */}
            <Field
              label="Product Images"
              hint="The first image is used as the cover photo."
            >
              <ImageUploader
                value={form.images}
                onChange={(urls) => update("images", urls)}
                token={token}
                max={6}
              />
            </Field>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="h-10 min-h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="h-10 min-h-11 gap-2 text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-70"
            style={{ backgroundColor: "var(--brand-orange)" }}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {product ? "Save Changes" : "Add Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <Switch checked={checked} onCheckedChange={onChange} />
      <span className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-[11px] text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

export default ProductFormDialog;
