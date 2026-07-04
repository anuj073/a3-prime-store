"use client";

import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Settings,
  Menu,
  ExternalLink,
  LogOut,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/store/brand-logo";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  active: string;
  onNavigate: (section: string) => void;
  children: ReactNode;
};

type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "settings", label: "Settings", icon: Settings },
];

function NavList({
  active,
  onNavigate,
  onAfterNavigate,
}: {
  active: string;
  onNavigate: (s: string) => void;
  onAfterNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Admin navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              onAfterNavigate?.();
            }}
            className={cn(
              "group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                isActive ? "text-foreground" : "opacity-90"
              )}
              style={isActive ? { color: "var(--brand-orange)" } : undefined}
            />
            <span>{item.label}</span>
            {isActive && (
              <span
                className="ml-auto h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--brand-orange)" }}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 border-b border-primary-foreground/15 px-4 py-5">
      <div className="flex size-10 items-center justify-center rounded-lg bg-white shadow-sm">
        <span
          className="text-lg font-extrabold brand-gradient-text"
          aria-hidden="true"
        >
          A3
        </span>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-primary-foreground">
          Admin Panel
        </span>
        <span className="text-[11px] text-primary-foreground/70">
          A3 Prime Store
        </span>
      </div>
    </div>
  );
}

export function AdminShell({ active, onNavigate, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const setView = useStore((s) => s.setView);
  const logoutAdmin = useStore((s) => s.logoutAdmin);

  const handleViewStore = () => {
    setView("store");
  };

  const handleLogout = () => {
    logoutAdmin();
    setView("store");
    toast.success("Signed out", {
      description: "You have been logged out of the admin panel.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background px-4 shadow-sm sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open admin menu"
        >
          <Menu className="size-5" />
        </Button>

        <div className="flex items-center gap-2 lg:hidden">
          <BrandLogo size="sm" showText={false} />
          <span className="text-sm font-bold">Admin Panel</span>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-[var(--brand-blue)]">A3 Prime</span>{" "}
            <span className="text-[var(--brand-orange)]">Store</span>{" "}
            <span className="text-muted-foreground">· Admin</span>
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewStore}
            className="h-9 gap-1.5"
          >
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">View Store</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-9 gap-1.5"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col bg-primary text-primary-foreground lg:flex">
          <SidebarBrand />
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <NavList active={active} onNavigate={onNavigate} />
          </div>
          <div className="border-t border-primary-foreground/15 p-3">
            <button
              onClick={handleViewStore}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Store className="size-4" />
              <span>Back to Storefront</span>
            </button>
          </div>
        </aside>

        {/* Mobile sidebar (Sheet) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="w-72 border-0 bg-primary p-0 text-primary-foreground"
          >
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <SidebarBrand />
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <NavList
                active={active}
                onNavigate={onNavigate}
                onAfterNavigate={() => setMobileOpen(false)}
              />
            </div>
            <div className="border-t border-primary-foreground/15 p-3">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleViewStore();
                }}
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Store className="size-4" />
                <span>Back to Storefront</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export default AdminShell;
