"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { useCart, useCurrency } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { EASE_OUT } from "@/components/motion";
import { SlideCommit } from "@/components/micro/slide-commit";
import { ShippingSelector } from "@/components/checkout/shipping-selector";
import { accountSession } from "@/lib/account-api";
import { cartNaira } from "@/lib/cart-api";
import {
  CHECKOUT_RECOVERY,
  StoreRequestError,
  paymentDestination,
  readCheckoutRecovery,
  storeRequest,
  validateCheckout,
  type BuyerCheckout,
  type CheckoutRecovery,
  type CheckoutSelection,
  type PaymentLink,
} from "@/lib/checkout-api";
import { Price } from "@/components/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { variantPrice } from "@/lib/stock";

type Step = 0 | 1 | 2;
const STEPS = ["Information", "Delivery", "Payment"] as const;

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
    <div
      className={cn("flex flex-col gap-1.5", className)}
      data-invalid={error ? true : undefined}
    >
      <Label className="flex flex-col items-stretch gap-1.5 text-[0.8125rem]">
        <span>{label}</span>
        {children}
      </Label>
      {error ? (
        <p
          id={`checkout-${label.toLowerCase().replaceAll(" ", "-")}-error`}
          className="text-[0.75rem] text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, setOpen, subtotal, hasIssues, loading, busy, error, refresh } =
    useCart();
  const { currency } = useCurrency();
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState(1);
  const [payState, setPayState] = useState<"idle" | "processing" | "done">(
    "idle",
  );
  const [saved, setSaved] = useState<BuyerCheckout | null>(null);
  const [selection, setSelection] = useState<CheckoutSelection | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [recoveryFailed, setRecoveryFailed] = useState(false);
  const [recovering, setRecovering] = useState(true);
  const [account, setAccount] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const recovery = useRef<CheckoutRecovery | null>(null);
  const action = useRef(false);
  const generation = useRef(0);
  const observedAccount = useRef<string | null>(null);
  useEffect(() => {
    let active = true;
    const check = async () => {
      const revision = ++generation.current;
      setSaved(null);
      setStep(0);
      setRecovering(true);
      setRecoveryFailed(false);
      setCheckoutError("");
      setAccount(null);
      try {
        const current = (await accountSession())?.user.id ?? "guest";
        if (!active || revision !== generation.current) return;
        if (
          observedAccount.current !== null &&
          observedAccount.current !== current
        ) {
          setForm({ name: "", email: "", phone: "" });
          setErrors({});
        }
        observedAccount.current = current;
        setAccount(current);
        const prior = readCheckoutRecovery();
        recovery.current = prior?.account === current ? prior : null;
        if (recovery.current) {
          try {
            const value = validateCheckout(
              await storeRequest<BuyerCheckout>(
                "checkout/recover",
                "POST",
                {},
                current,
                recovery.current.key,
              ),
            );
            if (!active || revision !== generation.current) return;
            setSaved(value);
            setStep(2);
            recovery.current = {
              ...recovery.current,
              checkoutId: value.checkoutId,
              orderId: value.orderId,
            };
            sessionStorage.setItem(
              CHECKOUT_RECOVERY,
              JSON.stringify(recovery.current),
            );
          } catch (cause) {
            // Retain the original key after a lost response. A fresh submission
            // with that key cannot create a duplicate order.
            if (
              prior?.checkoutId ||
              !(cause instanceof StoreRequestError) ||
              cause.status !== 404
            )
              throw cause;
          }
        }
      } catch (cause) {
        if (active && revision === generation.current) {
          setRecoveryFailed(true);
          setCheckoutError(
            cause instanceof Error
              ? cause.message
              : "Unable to restore checkout.",
          );
        }
      } finally {
        if (active && revision === generation.current) setRecovering(false);
      }
    };
    void check();
    const changed = () => {
      recovery.current = null;
      setSaved(null);
      setSelection(null);
      void check();
    };
    window.addEventListener("wearables:account-changed", changed);
    window.addEventListener("focus", changed);
    return () => {
      active = false;
      generation.current = -1;
      window.removeEventListener("wearables:account-changed", changed);
      window.removeEventListener("focus", changed);
    };
  }, []);

  const lines = useMemo(
    () =>
      items.flatMap((item) => {
        const product = item.product;
        return product ? [{ ...item, product }] : [];
      }),
    [items],
  );

  const deliveryFee = saved
    ? cartNaira(saved.order.shippingKobo)
    : selection
      ? cartNaira(selection.feeKobo)
      : null;
  const total = saved
    ? cartNaira(saved.order.totalKobo)
    : deliveryFee === null
      ? subtotal
      : subtotal + deliveryFee;
  const stockIssues = hasIssues;

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      err.email = "Enter a valid email";
    if (
      !/^(?:0[789]\d{9}|\+234[789]\d{9})$/.test(form.phone.replace(/[ -]/g, ""))
    )
      err.phone = "Enter a valid phone number";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const prepare = async () => {
    if (!selection || !account || action.current) return;
    action.current = true;
    setPayState("processing");
    setCheckoutError("");
    const revision = generation.current;
    try {
      const current = (await accountSession())?.user.id ?? "guest";
      if (current !== account || revision !== generation.current)
        throw new Error(
          "Your account changed. Reload checkout before continuing.",
        );
      const intent =
        recovery.current?.account === account
          ? recovery.current
          : { key: crypto.randomUUID(), account };
      recovery.current = intent;
      sessionStorage.setItem(CHECKOUT_RECOVERY, JSON.stringify(intent));
      const value = validateCheckout(
        await storeRequest<BuyerCheckout>(
          "checkout",
          "POST",
          {
            contact: {
              name: form.name.trim(),
              email: form.email.trim(),
              phone: form.phone,
            },
            shippingMethodId: selection.shippingMethodId,
            expectedShippingVersion: selection.expectedShippingVersion,
            ...(selection.delivery
              ? {
                  delivery: {
                    ...selection.delivery,
                    recipientName: form.name.trim(),
                  },
                }
              : {}),
          },
          account,
          intent.key,
        ),
      );
      if (revision !== generation.current) return;
      recovery.current = {
        ...intent,
        checkoutId: value.checkoutId,
        orderId: value.orderId,
      };
      sessionStorage.setItem(
        CHECKOUT_RECOVERY,
        JSON.stringify(recovery.current),
      );
      setSaved(value);
      goTo(2);
      void refresh();
    } catch (cause) {
      if (revision === generation.current)
        setCheckoutError(
          cause instanceof Error
            ? cause.message
            : "Unable to prepare checkout.",
        );
    } finally {
      action.current = false;
      setPayState("idle");
    }
  };
  const handlePay = async () => {
    if (!saved || !account || action.current) return;
    action.current = true;
    setPayState("processing");
    setCheckoutError("");
    const revision = generation.current;
    try {
      const link = await storeRequest<PaymentLink>(
        `checkout/${saved.checkoutId}/payment`,
        "POST",
        {},
        account,
      );
      if (revision !== generation.current) return;
      const destination = paymentDestination(link);
      if (destination) {
        window.location.assign(destination);
        return;
      }
      const updated = validateCheckout(
        await storeRequest<BuyerCheckout>(
          `checkout/${saved.checkoutId}`,
          "GET",
          undefined,
          account,
        ),
      );
      if (revision !== generation.current) return;
      setSaved(updated);
      setCheckoutError(
        updated.order.payment.status === "pending"
          ? "Payment initialization is still pending. Retry to resume this same payment attempt, or check the order status."
          : "This checkout cannot open a payment link. Check your order status before starting another checkout.",
      );
    } catch (cause) {
      if (revision === generation.current)
        setCheckoutError(
          cause instanceof Error ? cause.message : "Unable to open payment.",
        );
    } finally {
      action.current = false;
      setPayState("idle");
    }
  };
  const cancel = async () => {
    if (!saved || !account || action.current) return;
    action.current = true;
    setPayState("processing");
    setCheckoutError("");
    const revision = generation.current;
    try {
      await storeRequest(
        `checkout/${saved.checkoutId}/cancel`,
        "POST",
        {},
        account,
      );
      if (revision !== generation.current) return;
      sessionStorage.removeItem(CHECKOUT_RECOVERY);
      recovery.current = null;
      setSaved(null);
      setStep(0);
      await refresh();
      setCheckoutError(
        "Checkout cancelled. Add the pieces to your bag again if you would like to start over.",
      );
    } catch (cause) {
      if (revision === generation.current)
        setCheckoutError(
          cause instanceof Error ? cause.message : "Unable to cancel checkout.",
        );
    } finally {
      action.current = false;
      setPayState("idle");
    }
  };

  if (recovering)
    return (
      <div className="px-6 py-24 text-center" role="status">
        Checking your checkout…
      </div>
    );
  if (!account || (!saved && recoveryFailed))
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p role="alert">{checkoutError || "Unable to check your account."}</p>
        <button
          className="store-button mt-4"
          onClick={() => window.location.reload()}
        >
          Retry checkout
        </button>
        <Link href="/checkout/return" className="mt-4 block underline">
          Recover order access
        </Link>
      </div>
    );
  if (!saved && (loading || busy || error)) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center" role="status">
        <p>{error || "Loading your saved bag…"}</p>
        <Button onClick={() => setOpen(true)}>Review your bag</Button>
      </div>
    );
  }

  if (stockIssues && !saved) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="eyebrow">Availability update</p>
        <h1 className="font-display text-3xl">Let&apos;s update your bag.</h1>
        <p className="text-muted-foreground">
          Some pieces are unavailable or your quantities exceed the available
          stock. Adjust your bag before continuing.
        </p>
        <Button onClick={() => setOpen(true)}>Review your bag</Button>
        <Link href="/shop" className="link-underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  /* ---------- Empty cart ---------- */
  if (lines.length === 0 && !saved) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-32 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-muted">
          <ShoppingBagIcon className="size-6 text-muted-foreground" />
        </div>
        {checkoutError && <p role="status">{checkoutError}</p>}
        <p className="font-display text-2xl">Your bag is empty</p>
        <p className="text-sm text-muted-foreground">
          Add something beautiful before checking out.
        </p>
        <Button render={<Link href="/shop" />}>Browse the collection</Button>
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
              onClick={() => !saved && i < step && goTo(i as Step)}
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

      {checkoutError && (
        <p role="alert" className="mb-6 rounded-lg border p-4">
          {checkoutError}
        </p>
      )}
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
                  <h2 className="font-display text-xl tracking-tight">
                    Contact & shipping
                  </h2>
                  <Field label="Full name" error={errors.name}>
                    <Input
                      className={inputClass}
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Adaeze Okafor"
                      aria-invalid={!!errors.name}
                      aria-describedby={
                        errors.name ? "checkout-full-name-error" : undefined
                      }
                      autoComplete="name"
                    />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Email" error={errors.email}>
                      <Input
                        className={inputClass}
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        placeholder="you@example.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={
                          errors.email ? "checkout-email-error" : undefined
                        }
                        autoComplete="email"
                      />
                    </Field>
                    <Field label="Phone" error={errors.phone}>
                      <Input
                        className={inputClass}
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="+234 801 234 5678"
                        aria-invalid={!!errors.phone}
                        aria-describedby={
                          errors.phone ? "checkout-phone-error" : undefined
                        }
                        autoComplete="tel"
                      />
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
                  <h2 className="font-display text-xl tracking-tight">
                    Delivery method
                  </h2>
                  <ShippingSelector onChange={setSelection} />
                  <div className="mt-2 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => goTo(0)}>
                      <ArrowLeftIcon data-icon="inline-start" />
                      Back
                    </Button>
                    <Button
                      size="lg"
                      className="h-11 px-6 transition-transform duration-150 ease-out active:scale-[0.97]"
                      disabled={
                        !selection || payState === "processing" || !account
                      }
                      onClick={() => {
                        void prepare();
                      }}
                    >
                      Review order total
                      <ArrowRightIcon data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <h2 className="font-display text-xl tracking-tight">
                    Payment
                  </h2>

                  <div className="overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <LockIcon className="size-4" />
                      <p className="text-sm font-medium">
                        Pay securely with Paystack
                      </p>
                    </div>
                    {saved && (
                      <div className="mb-4 text-sm">
                        <p>Order {saved.order.number}</p>
                        <p>{saved.order.delivery.method}</p>
                        <p>{saved.order.delivery.estimate}</p>
                        <p className="mt-3 font-medium">
                          Final total: ₦
                          {cartNaira(saved.order.totalKobo).toLocaleString(
                            "en-NG",
                            { minimumFractionDigits: 2 },
                          )}
                        </p>
                        <p className="mt-2 text-muted-foreground">
                          Included VAT: ₦
                          {cartNaira(saved.order.taxKobo).toLocaleString(
                            "en-NG",
                            { minimumFractionDigits: 2 },
                          )}
                          . Payment is confirmed only after the server verifies
                          it.
                        </p>
                      </div>
                    )}
                    <p className="mb-4 text-sm text-muted-foreground">
                      Payment is in NGN. Your card details are entered on
                      Paystack’s hosted payment page.
                    </p>
                    {saved?.order.payment.status === "pending" && (
                      <SlideCommit
                        label={`Continue to Paystack — ₦${total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`}
                        processingLabel="Opening Paystack…"
                        doneLabel="Opening Paystack"
                        state={payState}
                        onCommit={() => {
                          void handlePay();
                        }}
                      />
                    )}
                    <Link
                      href="/checkout/return"
                      className="mt-4 block underline"
                    >
                      Check order status
                    </Link>
                    {saved &&
                      (["confirmed", "cancelled", "refunded"].includes(
                        saved.order.payment.status,
                      ) ||
                        saved.order.payment.retryAction ===
                          "start_new_checkout") && (
                        <button
                          type="button"
                          className="store-text-link mt-4"
                          onClick={() => {
                            sessionStorage.removeItem(CHECKOUT_RECOVERY);
                            recovery.current = null;
                            setSaved(null);
                            setStep(0);
                            void refresh();
                          }}
                        >
                          Begin another checkout
                        </button>
                      )}
                  </div>

                  <div className="mt-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        void cancel();
                      }}
                      disabled={
                        payState === "processing" ||
                        !saved ||
                        !["pending", "failed"].includes(
                          saved.order.payment.status,
                        )
                      }
                    >
                      <ArrowLeftIcon data-icon="inline-start" />
                      Cancel this checkout
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-xl border bg-card p-5 lg:sticky lg:top-32">
          <h2 className="mb-4 font-display text-lg tracking-tight">
            Order summary
          </h2>
          <div className="flex max-h-64 flex-col gap-4 overflow-y-auto pr-1">
            {saved ? (
              saved.order.lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span>
                    {line.productName}
                    <small className="block text-muted-foreground">
                      {line.sizeLabel} · {line.quantity}
                    </small>
                  </span>
                  <span>
                    ₦
                    {cartNaira(line.totalKobo).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))
            ) : (
              <>
                {" "}
                {lines.map((line) => (
                  <div
                    key={`${line.productId}-${line.size ?? "os"}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {line.product.images[0] && (
                        <Image
                          src={line.product.images[0]}
                          unoptimized
                          alt={line.product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                      <span className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-espresso text-[0.5625rem] font-semibold text-espresso-foreground tabular-nums">
                        {line.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.8125rem] font-medium">
                        {line.product.name}
                      </p>
                      <p className="text-[0.6875rem] text-muted-foreground">
                        {line.size !== null ? `Size ${line.size}` : "One size"}
                      </p>
                    </div>
                    <p className="text-[0.8125rem] tabular-nums">
                      {formatPrice(
                        variantPrice(line.product, line.size) * line.qty,
                        currency,
                      )}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
          <Separator className="my-4" />
          <dl className="flex flex-col gap-2 text-[0.8125rem]">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">
                <Price
                  amountNGN={
                    saved ? cartNaira(saved.order.subtotalKobo) : subtotal
                  }
                />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="tabular-nums">
                {deliveryFee === null ? (
                  "Choose delivery"
                ) : deliveryFee === 0 ? (
                  "Free"
                ) : (
                  <Price amountNGN={deliveryFee} />
                )}
              </dd>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-base font-medium">
              <dt>Total</dt>
              <dd className="font-display tabular-nums">
                {saved ? (
                  `₦${total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
                ) : (
                  <Price amountNGN={total} />
                )}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
