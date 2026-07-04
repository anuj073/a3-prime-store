"use client";

import {
  Tag,
  Coffee,
  Milk,
  ShoppingBasket,
  Sparkles,
  Apple,
  Utensils,
  Snowflake,
  Droplets,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

type CategoryBarProps = {
  categories: Category[];
  selected: string;
  onSelect: (cat: string) => void;
};

const iconMap: Record<string, LucideIcon> = {
  coffee: Coffee,
  milk: Milk,
  shopping_basket: ShoppingBasket,
  shopping: ShoppingBasket,
  basket: ShoppingBasket,
  sparkles: Sparkles,
  apple: Apple,
  utensils: Utensils,
  snowflake: Snowflake,
  droplets: Droplets,
  groceries: ShoppingBasket,
  dairy: Milk,
  beverages: Coffee,
  snacks: Sparkles,
  "home-care": Droplets,
  "personal-care": Droplets,
  grocery: ShoppingBasket,
  store: Tag,
};

function resolveIcon(name?: string | null): LucideIcon {
  if (!name) return Tag;
  const key = name.toLowerCase().trim().replace(/\s+/g, "-");
  return iconMap[key] || Tag;
}

export function CategoryBar({
  categories,
  selected,
  onSelect,
}: CategoryBarProps) {
  const activeCats = categories.filter((c) => c.active !== false);

  return (
    <div className="sticky top-16 z-30 -mx-3 mb-2 bg-background/90 px-3 py-3 backdrop-blur-md sm:mx-0 sm:px-0">
      <div className="scrollbar-thin flex w-full gap-2 overflow-x-auto pb-1">
        <ChipButton
          active={selected === "all"}
          onClick={() => onSelect("all")}
          icon={Tag}
          label="All Products"
        />
        {activeCats.map((cat) => {
          const Icon = resolveIcon(cat.icon);
          return (
            <ChipButton
              key={cat.id}
              active={selected === cat.name}
              onClick={() => onSelect(cat.name)}
              icon={Icon}
              label={cat.name}
            />
          );
        })}
      </div>
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-all",
        active
          ? "border-transparent bg-primary text-primary-foreground shadow-sm"
          : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
      )}
      aria-pressed={active}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

export default CategoryBar;
