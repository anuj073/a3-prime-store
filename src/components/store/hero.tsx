"use client";

import { motion } from "framer-motion";
import {
  Truck,
  BadgeCheck,
  Wallet,
  Phone,
  ShoppingBag,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StoreSettings } from "@/lib/types";

type HeroProps = {
  settings: StoreSettings;
};

const trustFeatures = [
  { icon: Truck, title: "Fast Delivery", desc: "Local same-day delivery" },
  { icon: BadgeCheck, title: "Quality Products", desc: "Trusted brands only" },
  { icon: Wallet, title: "Best Prices", desc: "Honest, everyday pricing" },
  { icon: Phone, title: "Call to Order", desc: "6391304606" },
];

export function Hero({ settings }: HeroProps) {
  const heroImage = settings.heroImageUrl || "/brand/hero.png";

  const scrollToProducts = () => {
    const el = document.getElementById("products-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background gradient layer */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--brand-blue) 8%, transparent) 0%, transparent 40%, color-mix(in oklab, var(--brand-orange) 12%, transparent) 100%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-5"
          >
            {settings.announcement && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <Badge
                  className="brand-gradient-bg gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                  variant="default"
                >
                  <Sparkles className="size-3" />
                  {settings.announcement}
                </Badge>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            >
              <span className="text-foreground">Fresh Products.</span>
              <br />
              <span className="brand-gradient-text">Honest Prices.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              {settings.heroSubtitle ||
                "Everything your home needs, delivered with care from A3 Prime Store."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              <Button
                size="lg"
                onClick={scrollToProducts}
                className="h-12 gap-2 px-6 text-base text-white shadow-md transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: "var(--brand-orange)" }}
              >
                <ShoppingBag className="size-5" />
                Shop Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToProducts}
                className="h-12 gap-2 px-6 text-base"
              >
                View Offers
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>

            {settings.freeShipMsg && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-sm font-medium text-[var(--brand-orange)]"
              >
                {settings.freeShipMsg}
              </motion.p>
            )}
          </motion.div>

          {/* Right column: hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="relative order-first lg:order-last"
          >
            <div className="relative overflow-hidden rounded-2xl border shadow-xl">
              <img
                src={heroImage}
                alt="A3 Prime Store — your neighborhood store"
                className="aspect-[16/10] w-full object-cover sm:aspect-[16/9] lg:aspect-[4/3]"
                loading="eager"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in oklab, var(--brand-blue) 25%, transparent), transparent 50%)",
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                <div className="rounded-lg bg-background/90 px-3 py-2 backdrop-blur-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    Owned by
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {settings.ownerName || "Akash Maurya"}
                  </p>
                </div>
                <div className="rounded-lg bg-background/90 px-3 py-2 text-right backdrop-blur-sm">
                  <p className="text-xs font-medium text-muted-foreground">
                    Located at
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    Jaunpur, UP
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 grid grid-cols-2 gap-3 border-t pt-8 sm:mt-12 lg:grid-cols-4 sm:gap-4"
        >
          {trustFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-xl border bg-card p-3 shadow-sm sm:p-4"
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: "var(--brand-blue)" }}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {f.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
