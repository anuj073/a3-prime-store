"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ShoppingBag,
  Loader2,
  Phone,
  User,
  MapPin,
  StickyNote,
  ArrowRight,
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

type CheckoutModalProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPlaced: () => void;
};

const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 40;

function formatPrice(p: number): string {
  return `₹${Number.isInteger(p) ? p : p.toFixed(2)}`;
}

type FormState = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function CheckoutModal({
  open,
  onOpenChange,
  onPlaced,
}: CheckoutModalProps) {
  const cart = useStore((s) => s.cart);
  const clearCart = useStore((s) => s.clearCart);
  const setCartOpen = useStore((s) => s.setCartOpen);

  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerNote: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setPlacedOrder(null);
      setErrors({});
    }
  }, [open]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryCharge =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryCharge;

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.customerName.trim()) e.customerName = "Name is required";
    else if (form.customerName.trim().length < 2)
      e.customerName = "Please enter a valid name";

    const phone = form.customerPhone.trim();
    if (!phone) e.customerPhone = "Phone number is required";
    else if (!/^\d{10}$/.test(phone))
      e.customerPhone = "Enter a valid 10-digit phone number";

    if (!form.customerAddress.trim())
      e.customerAddress = "Delivery address is required";
    else if (form.customerAddress.trim().length < 10)
      e.customerAddress = "Please enter a complete address";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!validate()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setSubmitting(true);
    try {
      const order = await api.createOrder({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerAddress: form.customerAddress.trim(),
        customerNote: form.customerNote.trim() || null,
        items: cart.map((c) => ({
          productId: c.productId,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          imageUrl: c.imageUrl,
          unit: c.unit,
        })),
        subtotal,
        deliveryCharge,
        total,
      });
      clearCart();
      setPlacedOrder(order);
      toast.success("Order placed successfully!", {
        description: `Order ${order.orderNumber}`,
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to place order";
      toast.error("Order failed", { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    onOpenChange(false);
    setPlacedOrder(null);
    setForm({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      customerNote: "",
    });
    onPlaced();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!submitting) onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl scrollbar-thin">
        {placedOrder ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <CheckCircle2 className="size-12 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Order Placed!
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Thank you for shopping with A3 Prime Store.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Order Number
              </p>
              <p className="mt-1 text-lg font-bold text-[var(--brand-blue)]">
                {placedOrder.orderNumber}
              </p>
              <Separator className="my-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold text-foreground">
                  {formatPrice(placedOrder.total)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize text-amber-600">
                  {placedOrder.status}
                </span>
              </div>
            </div>
            <p className="max-w-sm text-xs text-muted-foreground">
              We&apos;ll call you shortly on{" "}
              <span className="font-medium">
                {placedOrder.customerPhone}
              </span>{" "}
              to confirm your order and delivery time.
            </p>
            <Button
              onClick={handleContinue}
              className="mt-2 h-12 gap-2 px-6 text-white"
              style={{ backgroundColor: "var(--brand-orange)" }}
            >
              <ShoppingBag className="size-5" />
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Checkout
              </DialogTitle>
              <DialogDescription>
                Enter your delivery details to place the order.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >
              {/* Left: Form */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ck-name" className="gap-1.5">
                    <User className="size-3.5" /> Full Name *
                  </Label>
                  <Input
                    id="ck-name"
                    value={form.customerName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customerName: e.target.value }))
                    }
                    placeholder="e.g. Akash Maurya"
                    aria-invalid={!!errors.customerName}
                    className="h-10"
                  />
                  {errors.customerName && (
                    <p className="text-xs text-destructive">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ck-phone" className="gap-1.5">
                    <Phone className="size-3.5" /> Phone Number *
                  </Label>
                  <Input
                    id="ck-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.customerPhone}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        customerPhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    placeholder="10-digit mobile number"
                    aria-invalid={!!errors.customerPhone}
                    className="h-10"
                  />
                  {errors.customerPhone && (
                    <p className="text-xs text-destructive">
                      {errors.customerPhone}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ck-addr" className="gap-1.5">
                    <MapPin className="size-3.5" /> Delivery Address *
                  </Label>
                  <Textarea
                    id="ck-addr"
                    value={form.customerAddress}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        customerAddress: e.target.value,
                      }))
                    }
                    placeholder="House no., street, area, city, pincode"
                    aria-invalid={!!errors.customerAddress}
                    className="min-h-20"
                  />
                  {errors.customerAddress && (
                    <p className="text-xs text-destructive">
                      {errors.customerAddress}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ck-note" className="gap-1.5">
                    <StickyNote className="size-3.5" /> Note (optional)
                  </Label>
                  <Textarea
                    id="ck-note"
                    value={form.customerNote}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customerNote: e.target.value }))
                    }
                    placeholder="Any special instructions for delivery..."
                    className="min-h-16"
                  />
                </div>
              </div>

              {/* Right: Summary */}
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="mb-2 text-sm font-semibold text-foreground">
                    Order Summary
                  </p>
                  <ul className="scrollbar-thin max-h-44 space-y-2 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <li
                        key={item.productId}
                        className="flex items-start justify-between gap-2 text-sm"
                      >
                        <div className="flex min-w-0 flex-1 gap-2">
                          <span className="shrink-0 font-medium text-muted-foreground">
                            {item.quantity}×
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-foreground">
                              {item.name}
                            </p>
                            {item.unit && (
                              <p className="text-xs text-muted-foreground">
                                {item.unit}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 font-medium text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                    {cart.length === 0 && (
                      <li className="py-4 text-center text-sm text-muted-foreground">
                        Cart is empty
                      </li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium">
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-600">FREE</span>
                      ) : (
                        formatPrice(deliveryCharge)
                      )}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-extrabold text-[var(--brand-blue)]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  By placing this order, you agree to be contacted on your phone
                  for delivery confirmation.
                </p>
              </div>

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className={cn(
                    "h-12 w-full gap-2 text-base font-semibold text-white shadow-md transition-transform hover:scale-[1.01] disabled:opacity-60",
                  )}
                  style={{ backgroundColor: "var(--brand-orange)" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order • {formatPrice(total)}
                      <ArrowRight className="size-5" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    onOpenChange(false);
                    setCartOpen(true);
                  }}
                  className="mt-1 h-10 w-full text-sm"
                >
                  Back to Cart
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CheckoutModal;
