"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  unit?: string;
  quantity: number;
  maxStock: number;
};

type AppState = {
  // Admin auth
  isAdmin: boolean;
  adminToken: string | null;
  setAdmin: (token: string) => void;
  logoutAdmin: () => void;

  // Cart
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;

  // View mode (store / admin)
  view: "store" | "admin";
  setView: (view: "store" | "admin") => void;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      adminToken: null,
      setAdmin: (token) => set({ isAdmin: true, adminToken: token }),
      logoutAdmin: () =>
        set({ isAdmin: false, adminToken: null, view: "store" }),

      cart: [],
      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),
      addToCart: (item, qty = 1) => {
        const existing = get().cart.find((c) => c.productId === item.productId);
        if (existing) {
          const newQty = Math.min(existing.quantity + qty, item.maxStock || 99);
          set({
            cart: get().cart.map((c) =>
              c.productId === item.productId ? { ...c, quantity: newQty } : c
            ),
          });
        } else {
          set({
            cart: [...get().cart, { ...item, quantity: Math.min(qty, item.maxStock || 99) }],
          });
        }
      },
      removeFromCart: (productId) =>
        set({ cart: get().cart.filter((c) => c.productId !== productId) }),
      updateQuantity: (productId, qty) =>
        set({
          cart: get().cart.map((c) =>
            c.productId === productId
              ? { ...c, quantity: Math.max(1, Math.min(qty, c.maxStock || 99)) }
              : c
          ),
        }),
      clearCart: () => set({ cart: [] }),

      view: "store",
      setView: (view) => set({ view }),
    }),
    {
      name: "a3-prime-store",
      partialize: (state) => ({
        isAdmin: state.isAdmin,
        adminToken: state.adminToken,
        cart: state.cart,
        view: state.view,
      }),
    }
  )
);
