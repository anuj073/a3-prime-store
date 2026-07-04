# Task 2-B — Admin Panel Components (full-stack-developer)

## Task
Build the 10 admin panel components under `src/components/admin/` for the A3 Prime Store e-commerce site.

## Files Created
1. `src/components/admin/login-dialog.tsx` — `LoginDialog` (controlled modal with password show/hide, orange Login button, "Back to Store" link)
2. `src/components/admin/admin-shell.tsx` — `AdminShell` (sticky top bar, desktop deep-blue sidebar w/ nav, mobile Sheet sidebar, View Store / Logout buttons)
3. `src/components/admin/image-uploader.tsx` — `ImageUploader` (multi-image grid + dashed dropzone, click-or-drop, parallel upload with `api.uploadImage`, hover-to-remove thumbnails, "Cover" badge on first image)
4. `src/components/admin/product-form-dialog.tsx` — `ProductFormDialog` (max-w-2xl Dialog, controlled form w/ validation, all product fields incl. unit Select + Featured/Active switches + ImageUploader)
5. `src/components/admin/product-manager.tsx` — `ProductManager` (search + category filter + Add Product CTA, shadcn Table w/ stock/status/featured badges, AlertDialog delete confirm, ProductFormDialog integration)
6. `src/components/admin/category-manager.tsx` — `CategoryManager` (grid of category cards + Add/Edit Dialog w/ icon suggestions + image uploader + AlertDialog delete)
7. `src/components/admin/orders-manager.tsx` — `OrdersManager` (4 stat cards, status filter Select, shadcn Table w/ status badges, click row → details Dialog with items, totals, call-customer CTA)
8. `src/components/admin/settings-form.tsx` — `SettingsForm` (4 Cards: Store Identity, Contact & Location, Homepage Hero, Security; ImageUploader for logo + hero; sticky bottom Save bar; phone-required validation)
9. `src/components/admin/dashboard.tsx` — `Dashboard` (welcome banner, 4 stat cards, Low Stock Alert / Recent Orders / Featured Products cards w/ scroll areas, "Manage Products / View Orders" CTAs that navigate via `onNavigate`)
10. `src/components/admin/admin-panel.tsx` — default `AdminPanel` orchestrator (gates on `isAdmin` + `adminToken`: shows access-required card w/ "Sign In" button → LoginDialog when not authed; renders AdminShell + active section when authed)

## Key Design Decisions
- **Brand styling**: All primary CTAs use `bg-primary text-primary-foreground`; orange CTAs use `style={{ backgroundColor: 'var(--brand-orange)' }}` with white text. Sidebar uses `bg-primary text-primary-foreground` (deep blue) with orange accent dots/icons on the active item.
- **React 19 "adjust state during render" pattern**: Used in `ProductFormDialog` and `CategoryManager` to sync the form when `open`/`product`/`category` props change — compares `prevKey` with `currentKey` during render and calls `setState` only when they differ. This avoids the `react-hooks/set-state-in-effect` lint error pattern that Task 2-A also had to work around.
- **ImageUploader as a controlled component**: `value: string[]` + `onChange` — works for both multi-image (products) and single-image (category image, logo, hero) use cases by passing `max={1}`.
- **Sonner toasts** for all success/error feedback.
- **Price formatting**: `₹${value}` (no decimals when integer).
- **Touch targets**: All primary buttons use `h-10 min-h-11` (≥44px) per design system requirement.
- **Sticky footer on the settings page**: A `sticky bottom-4` Save bar inside the main scroll container — appears as a floating bar at the bottom of the viewport.
- **Admin auth gate**: When `!isAdmin || !adminToken`, the page renders a centered card with a "Sign In" button that opens `LoginDialog`. After successful login (`setAdmin(token)`), the store's `view` is set to `"admin"` and the AdminShell renders.
- **Sidebar nav active state**: `AdminShell` is fully controlled via `{ active, onNavigate }` props; the orchestrator (`AdminPanel`) holds the active section in local state and passes `setActive` to Dashboard's "Manage Products" / "View Orders" CTAs.
- **Mobile sidebar**: Hamburger in the top bar opens a left-side `Sheet` (deep blue bg) with the same nav list.
- **Tables**: Wrapped in `max-h-[60vh] overflow-y-auto scrollbar-thin`; sticky header via `sticky top-0 z-10 bg-muted/80 backdrop-blur`.
- **Order items**: Read-only view (no status-update API call required by spec); a "Call Customer" button uses `<a href="tel:...">`.
- **Status colors**: pending=amber, confirmed=blue, delivered=emerald, cancelled=destructive red. Revenue only counts non-pending/non-cancelled orders.

## Lint / Type Status
- `bun run lint` → exit 0 (no errors, no warnings).
- `bunx tsc --noEmit --skipLibCheck` → no errors in any `src/components/admin/*` file (only pre-existing errors in `examples/` and `skills/` which are out of scope).
- Dev server compiled all new files successfully (verified via `dev.log`).

## Integration Notes for Page Agent
- Default export: `import AdminPanel from "@/components/admin/admin-panel"`.
- `AdminPanel` returns its own `min-h-screen` wrapper for both the auth-gate screen and the authenticated AdminShell — page.tsx only needs to mount it conditionally based on `view === "admin"` from `useStore`.
- `AdminPanel` reads `useStore` for `isAdmin`, `adminToken`, `setView` — no props required.
- After `LoginDialog` succeeds, `setAdmin(token)` and `setView("admin")` are called automatically; the persisted store keeps the user logged in across reloads.
- Logout button in `AdminShell` calls `logoutAdmin()` (clears token + resets view to "store") and shows a toast.
- The "View Store" button in `AdminShell` calls `setView("store")` (keeps admin session alive — user can switch back without re-logging in).
- Dashboard's "Manage Products" / "View Orders" CTAs accept an optional `onNavigate` prop to switch sections in the parent. If not provided, they no-op.
- All admin API calls pass `token` from `useStore.adminToken` as the `x-admin-token` header (handled by the `api` helper).

## Reusable Components Exported
- `LoginDialog` — useful if the page agent wants to expose login from elsewhere.
- `ImageUploader` — reusable for any image upload field; supports both multi and single (pass `max={1}`).
- `ProductFormDialog` — can be reused standalone for quick-add flows.

## Pre-existing files NOT modified
- `src/lib/store.ts`, `src/lib/api.ts`, `src/lib/types.ts` — used as-is per the task brief.
- `src/components/store/*` — not modified.
- `src/app/page.tsx` — not modified (integrator handles wiring).
- `prisma/schema.prisma` — not modified.
