"use client";

import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";

type CartDrawerProps = {
  onCheckout: () => void;
};

const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 40;

function formatPrice(p: number): string {
  return `₹${Number.isInteger(p) ? p : p.toFixed(2)}`;
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const cart = useStore((s) => s.cart);
  const cartOpen = useStore((s) => s.cartOpen);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const clearCart = useStore((s) => s.clearCart);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryCharge =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryCharge;
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg font-bold">
              <ShoppingCart className="size-5 text-[var(--brand-blue)]" />
              Your Cart
              {itemCount > 0 && (
                <Badge
                  className="ml-1 px-1.5 py-0 text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--brand-orange)" }}
                >
                  {itemCount}
                </Badge>
              )}
            </SheetTitle>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            )}
          </div>
          <SheetDescription className="sr-only">
            Shopping cart with {itemCount} items
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-10 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add products to your cart to get started.
              </p>
            </div>
            <Button
              onClick={() => setCartOpen(false)}
              variant="default"
              className="h-11 gap-2 px-5"
            >
              Continue Shopping
              <ArrowRight className="size-4" />
            </Button>
          </div>
        ) : (
          <>
            {/* Free delivery progress */}
            {remainingForFreeDelivery > 0 ? (
              <div className="border-b bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Add{" "}
                  <span className="font-bold text-[var(--brand-orange)]">
                    {formatPrice(remainingForFreeDelivery)}
                  </span>{" "}
                  more for <span className="font-semibold">FREE delivery</span>
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%`,
                      backgroundColor: "var(--brand-orange)",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="border-b bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  🎉 You&apos;ve unlocked FREE delivery!
                </p>
              </div>
            )}

            {/* Items list */}
            <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
              <ul className="flex flex-col gap-3">
                {cart.map((item) => (
                  <li
                    key={item.productId}
                    className="flex gap-3 rounded-xl border bg-card p-3 shadow-sm"
                  >
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="size-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">
                        {item.name}
                      </p>
                      {item.unit && (
                        <p className="text-xs text-muted-foreground">
                          {item.unit}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[var(--brand-blue)]">
                          {formatPrice(item.price)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5 rounded-lg border">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="flex size-7 items-center justify-center rounded-l-lg transition-colors hover:bg-accent disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span
                            className="min-w-8 text-center text-sm font-semibold"
                            aria-live="polite"
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={item.quantity >= (item.maxStock || 99)}
                            className="flex size-7 items-center justify-center rounded-r-lg transition-colors hover:bg-accent disabled:opacity-50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer summary */}
            <div className="border-t bg-background p-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-foreground">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      formatPrice(deliveryCharge)
                    )}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-foreground">
                    Total
                  </span>
                  <span className="text-xl font-extrabold text-[var(--brand-blue)]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Button
                onClick={onCheckout}
                className="mt-4 h-12 w-full gap-2 text-base font-semibold text-white shadow-md transition-transform hover:scale-[1.01]"
                style={{ backgroundColor: "var(--brand-orange)" }}
              >
                Proceed to Checkout
                <ArrowRight className="size-5" />
              </Button>
              <Button
                onClick={() => setCartOpen(false)}
                variant="ghost"
                className="mt-1 h-10 w-full text-sm"
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;
