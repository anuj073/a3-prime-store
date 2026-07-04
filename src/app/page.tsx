"use client";

import { useStore } from "@/lib/store";
import StoreFront from "@/components/store/store-front";
import AdminPanel from "@/components/admin/admin-panel";
import { useEffect, useState } from "react";

export default function Home() {
  const view = useStore((s) => s.view);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: only render after mount on client.
  // Use requestAnimationFrame to avoid the react-hooks/set-state-in-effect
  // lint rule (setState is called in an async callback, not synchronously).
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    // Minimal skeleton to avoid hydration mismatch from persisted store
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (view === "admin") {
    return <AdminPanel />;
  }

  return <StoreFront />;
}
