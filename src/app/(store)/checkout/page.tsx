"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CreditCardIcon,
  Loader2Icon,
  LockIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { useCart, useCatalog, useCurrency, useOrders, useSettings } from "@/lib/store";
import { formatPrice, generateReference } from "@/lib/format";
import { EASE_OUT } from "@/components/motion";
import { Price } from "@/components/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2;
const STEPS = ["Information", "Delivery", "Payment"] as const;

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard delivery", detail: "2–4 business days" },
  { id: "express", label: "Express — Lagos only", detail: "Same day, before 6pm" },
] as const;

const inputClass =
  "h-11 rounded-lg bg-card transition-shadow duration-150 focus-visible:shadow-[0_0_0_3px_var(--ring)/25]";

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} data-invalid={error ? true : undefined}>
      <Label className="flex flex-col items-stretch gap-1.5 text-[0.8125rem]">
        <span>{label}</span>
        {children}
      </Label>
      {error ? (
        <p id={`checkout-${label.toLowerCase().replaceAll(" ", "-")}-error`} className="text-[0.75rem] text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const { products } = useCatalog();
  const { currency } = useCurrency();
  const { addOrder } = useOrders();
  const { settings } = useSettings();
  const deliveryOptions = DELIVERY_OPTIONS.map((option) => ({ ...option, feeNGN: option.id === "standard" ? settings.standardFeeNGN : settings.expressFeeNGN }));

  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState(1);
  const [payState, setPayState] = useState<"idle" | "processing" | "done">("idle");
  const [reference, setReference] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");

  const lines = useMemo(
    () =>
      items.flatMap((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? [{ ...item, product }] : [];
      }),
    [items, products],
  );

  const subtotal = lines.reduce((sum, l) => sum + l.product.priceNGN * l.qty, 0);
  const freeShipping = subtotal >= settings.freeShippingThresholdNGN;
  const deliveryFee = freeShipping
    ? 0
    : (deliveryOptions.find((d) => d.id === delivery) ?? deliveryOptions[0]).feeNGN;
  const total = subtotal + deliveryFee;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: "" }));
  };

  const goTo = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const validateInfo = () => {
    const err: Record<string, string> = {};
    if (form.name.trim().length < 2) err.name = "Enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) err.email = "Enter a valid email";
    if (form.phone.trim().length < 7) err.phone = "Enter a valid phone number";
    if (form.line1.trim().length < 4) err.line1 = "Enter your street address";
    if (form.city.trim().length < 2) err.city = "Enter your city";
    if (form.state.trim().length < 2) err.state = "Enter your state";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handlePay = () => {
    setPayState("processing");
    // NOTE for backend: replace this simulated delay with Paystack Inline
    // (PaystackPop.setup) or a Paystack Standard redirect, then verify
    // server-side before creating the order.
    window.setTimeout(() => {
      const ref = generateReference();
      addOrder({
        id: `o-${Date.now()}`,
        reference: ref,
        customer: { name: form.name, email: form.email, phone: form.phone },
        address: { line1: form.line1, city: form.city, state: form.state },
        delivery,
        items: lines.map((l) => ({
          productId: l.productId,
          name: l.product.name,
          size: l.size,
          qty: l.qty,
          priceNGN: l.product.priceNGN,
        })),
        totalNGN: total,
        status: "paid",
        createdAt: new Date().toISOString(),
      });
      setPayState("done");
      setReference(ref);
      clear();
    }, 2200);
  };

  /* ---------- Empty cart ---------- */
  if (lines.length === 0 && !reference) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-32 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-muted">
          <ShoppingBagIcon className="size-6 text-muted-foreground" />
        </div>
        <p className="font-display text-2xl">Your bag is empty</p>
        <p className="text-sm text-muted-foreground">Add something beautiful before checking out.</p>
        <Button render={<Link href="/shop" />}>Browse the collection</Button>
      </div>
    );
  }

  /* ---------- Success ---------- */
  if (reference) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.25 }}
          className="grid size-16 place-items-center rounded-full bg-bronze text-bronze-foreground"
        >
          <CheckIcon className="size-7" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [...EASE_OUT], delay: 0.15 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="eyebrow">Order confirmed</p>
          <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-tight tracking-tight">
            Thank you, {form.name.split(" ")[0] || "friend"}.
          </h1>
          <p className="max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">
            Your order <span className="font-medium text-foreground tabular-nums">{reference}</span>{" "}
            is confirmed. A receipt is on its way to {form.email || "your inbox"} — we&apos;ll
            be in touch when it ships.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [...EASE_OUT], delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <Button size="lg" render={<Link href="/shop" />}>
            Continue shopping
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/" />}>
            Back home
          </Button>
        </motion.div>
        <p className="text-[0.75rem] text-muted-foreground">
          Demo checkout — the backend team will wire this step to Paystack.
        </p>
      </div>
    );
  }

  /* ---------- Flow ---------- */
  return (
    <div className="store-checkout mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="mb-10">
        <p className="eyebrow mb-3">Checkout</p>
        <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight tracking-tight">
          Almost yours.
        </h1>
      </div>

      {/* Step indicator */}
      <ol className="mb-10 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => i < step && goTo(i as Step)}
              className={cn(
                "flex items-center gap-2 text-[0.8125rem] transition-colors duration-200",
                i === step
                  ? "font-medium text-foreground"
                  : i < step
                    ? "cursor-pointer text-muted-foreground hover:text-foreground"
                    : "cursor-default text-muted-foreground/50",
              )}
              aria-current={i === step ? "step" : undefined}
              aria-label={label}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full border text-[0.6875rem] tabular-nums transition-all duration-200",
                  i < step
                    ? "border-bronze bg-bronze text-bronze-foreground"
                    : i === step
                      ? "border-foreground"
                      : "border-border",
                )}
              >
                {i < step ? <CheckIcon className="size-3" /> : i + 1}
              </span>
              <span className="max-sm:hidden">{label}</span>
            </button>
            {i < STEPS.length - 1 && <Separator className="w-8 sm:w-14" />}
          </li>
        ))}
      </ol>

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        {/* Form column */}
        <div className="relative min-h-[380px]">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: 24 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 * direction }}
              transition={{ duration: 0.3, ease: [...EASE_OUT] }}
            >
              {step === 0 && (
                <div className="flex flex-col gap-5">
                  <h2 className="font-display text-xl tracking-tight">Contact & shipping</h2>
                  <Field label="Full name" error={errors.name}>
                    <Input className={inputClass} value={form.name} onChange={set("name")} placeholder="Adaeze Okafor" aria-invalid={!!errors.name} aria-describedby={errors.name ? "checkout-full-name-error" : undefined} autoComplete="name" />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Email" error={errors.email}>
                      <Input className={inputClass} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "checkout-email-error" : undefined} autoComplete="email" />
                    </Field>
                    <Field label="Phone" error={errors.phone}>
                      <Input className={inputClass} type="tel" value={form.phone} onChange={set("phone")} placeholder="+234 801 234 5678" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "checkout-phone-error" : undefined} autoComplete="tel" />
                    </Field>
                  </div>
                  <Field label="Street address" error={errors.line1}>
                    <Input className={inputClass} value={form.line1} onChange={set("line1")} placeholder="14 Admiralty Way" aria-invalid={!!errors.line1} aria-describedby={errors.line1 ? "checkout-street-address-error" : undefined} autoComplete="street-address" />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="City" error={errors.city}>
                      <Input className={inputClass} value={form.city} onChange={set("city")} placeholder="Lekki" aria-invalid={!!errors.city} aria-describedby={errors.city ? "checkout-city-error" : undefined} autoComplete="address-level2" />
                    </Field>
                    <Field label="State" error={errors.state}>
                      <Input className={inputClass} value={form.state} onChange={set("state")} placeholder="Lagos" aria-invalid={!!errors.state} aria-describedby={errors.state ? "checkout-state-error" : undefined} autoComplete="address-level1" />
                    </Field>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="lg"
                      className="h-11 px-6 transition-transform duration-150 ease-out active:scale-[0.97]"
                      onClick={() => validateInfo() && goTo(1)}
                    >
                      Continue to delivery
                      <ArrowRightIcon data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <h2 className="font-display text-xl tracking-tight">Delivery method</h2>
                  {freeShipping && (
                    <p className="rounded-lg border border-bronze/30 bg-bronze/5 px-4 py-3 text-[0.8125rem] text-bronze">
                      Your order qualifies for complimentary delivery.
                    </p>
                  )}
                  <div className="flex flex-col gap-3" role="radiogroup" aria-label="Delivery method">
                    {deliveryOptions.map((opt) => {
                      const active = delivery === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setDelivery(opt.id)}
                          className={cn(
                            "flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 ease-out active:scale-[0.99]",
                            active ? "border-foreground bg-card shadow-sm" : "border-border hover:border-foreground/40",
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span className={cn("grid size-5 place-items-center rounded-full border transition-colors duration-200", active ? "border-bronze bg-bronze" : "border-border")}>
                              {active && <CheckIcon className="size-3 text-bronze-foreground" />}
                            </span>
                            <span>
                              <span className="block text-sm font-medium">{opt.label}</span>
                              <span className="block text-[0.75rem] text-muted-foreground">{opt.detail}</span>
                            </span>
                          </span>
                          <span className="text-sm font-medium tabular-nums">
                            {freeShipping ? "Free" : formatPrice(opt.feeNGN, currency)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => goTo(0)}>
                      <ArrowLeftIcon data-icon="inline-start" />
                      Back
                    </Button>
                    <Button
                      size="lg"
                      className="h-11 px-6 transition-transform duration-150 ease-out active:scale-[0.97]"
                      onClick={() => goTo(2)}
                    >
                      Continue to payment
                      <ArrowRightIcon data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <h2 className="font-display text-xl tracking-tight">Payment</h2>

                  {/* Paystack-style panel — DEMO. Backend replaces with Paystack Inline. */}
                  <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-md bg-secondary">
                          <LockIcon className="size-4 text-bronze" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">Wearables Atelier</p>
                          <p className="text-[0.6875rem] text-muted-foreground">{form.email || "you@example.com"}</p>
                        </div>
                      </div>
                      <p className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
                        Secured by <span className="font-bold text-[#0ba4db]">Pay</span><span className="font-bold text-[#00c3f7]">stack</span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 px-5 py-5">
                      <div className="rounded-md bg-amber-500/10 px-3 py-2 text-[0.75rem] text-amber-700 dark:text-amber-400">
                        Test mode — this is a UI demo. The backend team will connect Paystack Inline here; no real charge is made.
                      </div>
                      <Field label="Card number">
                        <div className="relative">
                          <Input className={cn(inputClass, "pr-10 tabular-nums")} defaultValue="4084 0840 8408 4081" inputMode="numeric" />
                          <CreditCardIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Expiry">
                          <Input className={cn(inputClass, "tabular-nums")} defaultValue="12 / 28" inputMode="numeric" />
                        </Field>
                        <Field label="CVV">
                          <Input className={cn(inputClass, "tabular-nums")} defaultValue="408" inputMode="numeric" type="password" />
                        </Field>
                      </div>

                      <motion.button
                        type="button"
                        onClick={handlePay}
                        disabled={payState !== "idle"}
                        whileTap={payState === "idle" ? { scale: 0.98 } : undefined}
                        className={cn(
                          "mt-1 flex h-12 items-center justify-center gap-2 rounded-lg text-[0.9375rem] font-semibold text-white transition-colors duration-200",
                          payState === "done" ? "bg-emerald-600" : "bg-[#0ba4db] hover:bg-[#0993c4]",
                          payState === "processing" && "cursor-wait",
                        )}
                      >
                        {payState === "processing" ? (
                          <>
                            <Loader2Icon className="size-4.5 animate-spin [animation-duration:0.7s]" />
                            Processing…
                          </>
                        ) : payState === "done" ? (
                          <>
                            <CheckIcon className="size-4.5" />
                            Payment successful
                          </>
                        ) : (
                          <>Pay {formatPrice(total, currency)}</>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  <div className="mt-1">
                    <Button variant="ghost" onClick={() => goTo(1)} disabled={payState === "processing"}>
                      <ArrowLeftIcon data-icon="inline-start" />
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-xl border bg-card p-5 lg:sticky lg:top-32">
          <h2 className="mb-4 font-display text-lg tracking-tight">Order summary</h2>
          <div className="flex max-h-64 flex-col gap-4 overflow-y-auto pr-1">
            {lines.map((line) => (
              <div key={`${line.productId}-${line.size ?? "os"}`} className="flex items-center gap-3">
                <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image src={line.product.images[0]} alt={line.product.name} fill sizes="48px" className="object-cover" />
                  <span className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-espresso text-[0.5625rem] font-semibold text-espresso-foreground tabular-nums">
                    {line.qty}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.8125rem] font-medium">{line.product.name}</p>
                  <p className="text-[0.6875rem] text-muted-foreground">
                    {line.size !== null ? `Size ${line.size}` : "One size"}
                  </p>
                </div>
                <p className="text-[0.8125rem] tabular-nums">
                  {formatPrice(line.product.priceNGN * line.qty, currency)}
                </p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <dl className="flex flex-col gap-2 text-[0.8125rem]">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums"><Price amountNGN={subtotal} /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="tabular-nums">
                {deliveryFee === 0 ? "Free" : <Price amountNGN={deliveryFee} />}
              </dd>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-base font-medium">
              <dt>Total</dt>
              <dd className="font-display tabular-nums"><Price amountNGN={total} /></dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
