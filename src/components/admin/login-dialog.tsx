"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  KeyRound,
  User,
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
import { BrandLogo } from "@/components/store/brand-logo";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { toast } from "sonner";

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // Recovery sub-dialog state
  const [resetOpen, setResetOpen] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const setAdmin = useStore((s) => s.setAdmin);
  const setView = useStore((s) => s.setView);

  const handleLogin = async () => {
    if (!password.trim()) {
      toast.error("Please enter the admin password");
      return;
    }
    setLoading(true);
    try {
      const { token } = await api.login(password.trim());
      setAdmin(token);
      setView("admin");
      setPassword("");
      setShow(false);
      onOpenChange(false);
      toast.success("Welcome back, Admin!", {
        description: "You are now signed in to the A3 Prime Store dashboard.",
      });
    } catch {
      toast.error("Invalid password", {
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStore = () => {
    setPassword("");
    setShow(false);
    onOpenChange(false);
    setView("store");
  };

  const handleResetPassword = async () => {
    if (!ownerName.trim()) {
      toast.error("Please enter the owner name");
      return;
    }
    setResetLoading(true);
    try {
      const res = await api.resetPassword(ownerName.trim());
      toast.success(res.message || "Password reset to admin123", {
        description: "Please log in with the default password.",
      });
      setOwnerName("");
      setResetOpen(false);
      setPassword("admin123");
      setShow(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reset failed";
      toast.error("Could not reset password", { description: message });
    } finally {
      setResetLoading(false);
    }
  };

  const closeReset = () => {
    setOwnerName("");
    setResetOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <div className="flex flex-col items-center gap-4">
            <BrandLogo size="lg" showText={false} />
            <DialogHeader className="items-center text-center">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <ShieldCheck
                  className="size-5"
                  style={{ color: "var(--brand-blue)" }}
                />
                Admin Login
              </DialogTitle>
              <DialogDescription>
                Sign in to manage products, orders, and store settings.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                  placeholder="Enter admin password"
                  className="h-11 pl-9 pr-10"
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="h-11 w-full gap-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-70"
              style={{ backgroundColor: "var(--brand-orange)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  Login
                </>
              )}
            </Button>

            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Default password: <span className="font-semibold">admin123</span>
              </p>
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <KeyRound className="size-3.5" />
                Forgot password?
              </button>
            </div>

            <button
              type="button"
              onClick={handleBackToStore}
              className="mx-auto inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Store
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot password / recovery sub-dialog */}
      <Dialog open={resetOpen} onOpenChange={(o) => (o ? setResetOpen(true) : closeReset())}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <KeyRound
                className="size-5"
                style={{ color: "var(--brand-orange)" }}
              />
              Reset Admin Password
            </DialogTitle>
            <DialogDescription>
              Enter the registered store owner name to reset the admin password
              back to the default <span className="font-semibold">admin123</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="owner-name" className="text-sm font-medium">
                Owner Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="owner-name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleResetPassword();
                  }}
                  placeholder="e.g. Akash Maurya"
                  className="h-11 pl-9"
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Recovery is granted to anyone who knows the registered owner
                name. Keep this information private.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="h-11 gap-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-70"
                style={{ backgroundColor: "var(--brand-orange)" }}
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Resetting…
                  </>
                ) : (
                  <>
                    <KeyRound className="size-4" />
                    Reset Password
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeReset}
                disabled={resetLoading}
                className="h-11"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LoginDialog;
