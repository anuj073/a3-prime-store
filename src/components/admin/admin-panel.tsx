"use client";

import { useState } from "react";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { AdminShell } from "./admin-shell";
import { LoginDialog } from "./login-dialog";
import { Dashboard } from "./dashboard";
import { ProductManager } from "./product-manager";
import { CategoryManager } from "./category-manager";
import { OrdersManager } from "./orders-manager";
import { SettingsForm } from "./settings-form";
import { BrandLogo } from "@/components/store/brand-logo";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function AdminPanel() {
  const isAdmin = useStore((s) => s.isAdmin);
  const adminToken = useStore((s) => s.adminToken);
  const setView = useStore((s) => s.setView);

  const [active, setActive] = useState<string>("dashboard");
  const [loginOpen, setLoginOpen] = useState(false);

  // Not authenticated: show a centered access-required card
  if (!isAdmin || !adminToken) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <BrandLogo size="lg" showText />
          </div>
          <div className="rounded-2xl border bg-card p-8 shadow-lg">
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className="flex size-16 items-center justify-center rounded-full text-white shadow-md"
                style={{ backgroundColor: "var(--brand-blue)" }}
              >
                <Lock className="size-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Admin access required
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in with the admin password to manage your store.
                </p>
              </div>
              <Button
                onClick={() => setLoginOpen(true)}
                className="h-11 w-full gap-2 text-white shadow-sm transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: "var(--brand-orange)" }}
              >
                <ShieldCheck className="size-4" />
                Sign In
              </Button>
              <button
                onClick={() => setView("store")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back to Store
              </button>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Default password: <span className="font-semibold">admin123</span>{" "}
            (change it in Settings after signing in)
          </p>
        </div>

        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    );
  }

  // Authenticated: render admin shell with the active section
  const renderSection = () => {
    switch (active) {
      case "dashboard":
        return <Dashboard token={adminToken} onNavigate={setActive} />;
      case "products":
        return <ProductManager token={adminToken} />;
      case "categories":
        return <CategoryManager token={adminToken} />;
      case "orders":
        return <OrdersManager token={adminToken} />;
      case "settings":
        return <SettingsForm token={adminToken} />;
      default:
        return <Dashboard token={adminToken} onNavigate={setActive} />;
    }
  };

  return (
    <AdminShell active={active} onNavigate={setActive}>
      {renderSection()}
    </AdminShell>
  );
}

export default AdminPanel;
