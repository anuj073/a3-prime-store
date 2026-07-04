"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  ShieldCheck,
  Loader2,
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

  return (
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

          <p className="text-center text-xs text-muted-foreground">
            Default password: <span className="font-semibold">admin123</span>
          </p>

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
  );
}

export default LoginDialog;
