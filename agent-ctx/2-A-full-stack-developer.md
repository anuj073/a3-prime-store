# Task 2-A — Storefront Components (full-stack-developer)

## Task
Build the 11 customer-facing store front components under `src/components/store/` for the A3 Prime Store e-commerce site.

## Files Created
1. `src/components/store/brand-logo.tsx` — `BrandLogo` (size sm/md/lg, optional text, optional settings.logoUrl)
2. `src/components/store/header.tsx` — `StoreHeader` (sticky, blur, search w/ mobile expand, theme toggle, cart badge, admin button)
3. `src/components/store/hero.tsx` — `Hero` (gradient + image, announcement badge, CTAs, trust strip, framer-motion)
4. `src/components/store/category-bar.tsx` — `CategoryBar` (horizontal scroll chips with resolved lucide icons)
5. `src/components/store/product-card.tsx` — `ProductCard` (image, discount/featured/OOS badges, stars, add-to-cart)
6. `src/components/store/product-grid.tsx` — `ProductGrid` (responsive grid, 8 skeleton loaders, empty state)
7. `src/components/store/product-modal.tsx` — `ProductModal` (Dialog, gallery + thumbnails, qty stepper, Add/Buy Now)
8. `src/components/store/cart-drawer.tsx` — `CartDrawer` (Sheet right, free-delivery progress, qty steppers, totals)
9. `src/components/store/checkout-modal.tsx` — `CheckoutModal` (Dialog, validated form, order summary, success screen)
10. `src/components/store/footer.tsx` — `StoreFooter` (deep-blue bg, 4 columns, social, bottom bar, sticky-ready)
11. `src/components/store/store-front.tsx` — default `StoreFront` orchestrator composing all the above

## Key Design Decisions
- Used `var(--brand-blue)` and `var(--brand-orange)` inline styles for brand-colored buttons/badges.
- Replaced the requested `CartPlus` icon (not exported by lucide-react 0.525) with `PackagePlus` (semantically equivalent "package + add").
- CategoryBar uses a small icon-map (Coffee, Milk, ShoppingBasket, Apple, Utensils, Snowflake, Droplets, Sparkles) with `Tag` as fallback.
- ProductModal state reset uses the React 19 "adjusting state during render" pattern (compare prevProductId) instead of `useEffect + setState`, to satisfy `react-hooks/set-state-in-effect` lint rule.
- StoreHeader mounted flag uses `requestAnimationFrame` instead of synchronous `useEffect(() => setMounted(true), [])` for the same lint reason.
- Search is debounced (250ms) inside StoreFront via `setTimeout` in the products `useEffect`.
- Free-delivery threshold = ₹499, else ₹40 — applied consistently in cart-drawer and checkout-modal.
- All interactive components are `"use client"`. BrandLogo and footer are also client (they use settings/logoUrl + onClick handlers).
- Sonner `toast` for all notifications (added-to-cart, order placed, order failed).

## Lint / Type Status
- `bun run lint` → exit 0 (clean).
- `bunx tsc --noEmit --skipLibCheck` → no errors in any `src/components/store/*` file (only pre-existing errors in `examples/` and `skills/` which are out of scope).
- Dev server compiled all new files successfully (verified via `dev.log`).

## Integration Notes for Page Agent
- Default export: `import StoreFront from "@/components/store/store-front"`.
- `StoreFront` returns a `<div className="flex min-h-screen flex-col">` with `<main className="flex-1">` so the footer naturally sticks to the bottom.
- `StoreFront` fetches its own settings/categories/products — page.tsx only needs to mount it inside the existing ThemeProvider.
- Admin view switching is handled inside the header via `useStore.setView("admin")`. The page agent should mount the admin panel based on `view === "admin"` from the same store.
- All overlays (ProductModal, CartDrawer, CheckoutModal) are rendered at the end of StoreFront so they appear above all content.
- The `#products-section` id (for "Shop Now" scroll target) is on the products `<section>` in StoreFront. Header logo scrolls to top of page.
