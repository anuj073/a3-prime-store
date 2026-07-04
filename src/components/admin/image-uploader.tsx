"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ProductImage } from "@/components/store/product-image";

type ImageUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  token: string;
  max?: number;
};

export function ImageUploader({
  value,
  onChange,
  token,
  max = 6,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const remaining = max - value.length;

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;

    const toUpload = arr.slice(0, remaining);
    if (toUpload.length < arr.length) {
      toast.info(`Only ${remaining} image(s) can be added (max ${max}).`);
    }
    if (toUpload.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];
    let failed = 0;
    await Promise.all(
      toUpload.map(async (file) => {
        try {
          const { url } = await api.uploadImage(file, token);
          newUrls.push(url);
        } catch {
          failed++;
        }
      })
    );
    setUploading(false);

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
      toast.success(`${newUrls.length} image(s) added`);
    }
    if (failed > 0) {
      toast.error(`${failed} image(s) failed to upload`);
    }
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    // Reset to allow re-selecting the same file
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeAt = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Thumbnails grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {value.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <ProductImage
                src={url}
                alt={`Image ${idx + 1}`}
                className="size-full"
                iconClassName="size-5 opacity-40"
              />
              {idx === 0 && (
                <span
                  className="absolute left-1 top-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow"
                  style={{ backgroundColor: "var(--brand-orange)" }}
                >
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                aria-label={`Remove image ${idx + 1}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {remaining > 0 && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/40 hover:border-primary/50 hover:bg-muted"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                Uploading…
              </p>
            </>
          ) : (
            <>
              <div
                className="flex size-10 items-center justify-center rounded-full text-white shadow-sm"
                style={{ backgroundColor: "var(--brand-blue)" }}
              >
                {value.length > 0 ? (
                  <ImagePlus className="size-5" />
                ) : (
                  <Upload className="size-5" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">
                  Click or drop images here
                </p>
                <p className="text-xs text-muted-foreground">
                  {value.length}/{max} added · PNG, JPG, WebP up to 8MB each
                </p>
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onInputChange}
          />
        </div>
      )}

      {remaining === 0 && (
        <p className="text-xs text-muted-foreground">
          Max image limit ({max}) reached. Remove one to add another.
        </p>
      )}
    </div>
  );
}

export default ImageUploader;
