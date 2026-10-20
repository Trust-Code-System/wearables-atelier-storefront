"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { accountSession } from "@/lib/account-api";
import {
  CHECKOUT_RECOVERY,
  readCheckoutRecovery,
  storeRequest,
  type BuyerOrder,
} from "@/lib/checkout-api";
import { cartNaira } from "@/lib/cart-api";

const descriptions: Record<string, { title: string; text: string }> = {
  pending: {
    title: "Payment pending",
    text: "We have not confirmed payment yet. You can leave this page; verification continues on the server.",
  },
  confirmed: {
    title: "Order confirmed",
    text: "Your payment has been verified and your pieces are allocated to this order.",
  },
  failed: {
    title: "Payment not completed",
    text: "The server has not recorded a successful payment. Check your order before starting another checkout.",
  },
  requires_review: {
    title: "Your order needs a review",
    text: "The store is reviewing your payment or stock allocation. Please do not pay again.",
  },
  cancelled: {
    title: "Checkout cancelled",
    text: "This checkout was cancelled. A later payment, if received, will still be verified and reviewed by the store.",
  },
  partially_refunded: {
    title: "Partially refunded",
    text: "The store has recorded a partial refund for this order.",
  },
  refunded: {
    title: "Refunded",
    text: "The store has recorded a refund for this order.",
  },
};
export function OrderStatus({ orderId }: { orderId?: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<BuyerOrder | null>(null);
  const [message, setMessage] = useState("Checking your order…");
  const [revision, setRevision] = useState(0);
  const [sending, setSending] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  useEffect(() => {
    let active = true,
      version = 0;
    const load = async (clear = false) => {
      const current = ++version;
      if (clear) setOrder(null);
      try {
        let id = orderId;
        if (!id) {
          const recovery = readCheckoutRecovery();
          const account = (await accountSession())?.user.id ?? "guest";
          if (!recovery?.orderId || recovery.account !== account)
            throw new Error(
              "No checkout was found for this browser and account. Request a secure access email below.",
            );
          id = recovery.orderId;
        }
        const value = await storeRequest<BuyerOrder>(
          `orders/${encodeURIComponent(id)}`,
        );
        cartNaira(value.totalKobo);
        if (!descriptions[value.payment.status])
          throw new Error("The order status is unavailable. Please retry.");
        if (active && current === version) {
          setOrder(value);
          setMessage("");
        }
      } catch (cause) {
        if (active && current === version) {
          setOrder(null);
          setMessage(
            cause instanceof Error
              ? cause.message
              : "Unable to check the order. Please retry.",
          );
        }
      }
    };
    void load(true);
    const focus = () => {
      void load(true);
    };
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 10000);
    window.addEventListener("focus", focus);
    window.addEventListener("wearables:account-changed", focus);
    return () => {
      active = false;
      version++;
      clearInterval(timer);
      window.removeEventListener("focus", focus);
      window.removeEventListener("wearables:account-changed", focus);
    };
  }, [orderId, revision]);
  const status = order ? descriptions[order.payment.status] : null;
  return (
    <section className="store-section mx-auto max-w-2xl px-6 py-16">
      <p className="store-label">Your order</p>
      <h1 className="mb-5 font-display text-3xl">
        {status?.title ?? "Check your order"}
      </h1>
      <p role="status">{message || status?.text}</p>
      {order && (
        <div className="my-6 rounded-xl border p-5">
          <p className="font-medium">{order.number}</p>
          <p>
            Total: ₦
            {cartNaira(order.totalKobo).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p>{order.delivery.method}</p>
          <p>{order.delivery.estimate}</p>
          <ul className="mt-4">
            {order.lines.map((line) => (
              <li key={line.id}>
                {line.productName} · {line.sizeLabel} · {line.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        className="store-text-link"
        onClick={() => setRevision((value) => value + 1)}
      >
        Refresh order status
      </button>
      {!orderId &&
        order &&
        ["pending", "failed"].includes(order.payment.status) && (
          <Link className="ml-4 underline" href="/checkout">
            Return to checkout
          </Link>
        )}
      {order &&
        ["confirmed", "cancelled", "refunded"].includes(
          order.payment.status,
        ) && (
          <button
            type="button"
            className="store-text-link ml-4"
            onClick={() => {
              sessionStorage.removeItem(CHECKOUT_RECOVERY);
              router.push("/checkout");
            }}
          >
            Begin another checkout
          </button>
        )}
      {!order && (
        <form
          className="my-6 flex flex-col gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (sending) return;
            const form = event.currentTarget,
              values = new FormData(form);
            setSending(true);
            setRecoveryMessage("");
            try {
              await storeRequest("orders/access/request", "POST", {
                orderNumber: String(values.get("orderNumber") ?? "").trim(),
                email: String(values.get("email") ?? "").trim(),
              });
              setRecoveryMessage(
                "If the details match an order, a secure access email will be sent. Check your inbox and spam folder.",
              );
              form.reset();
            } catch (cause) {
              setRecoveryMessage(
                cause instanceof Error
                  ? cause.message
                  : "Unable to request access.",
              );
            } finally {
              setSending(false);
            }
          }}
        >
          <h2 className="font-display text-xl">Recover access to an order</h2>
          <label className="flex flex-col gap-1">
            Order number
            <input
              className="rounded-lg border p-3"
              name="orderNumber"
              maxLength={100}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            Email used for this order
            <input
              className="rounded-lg border p-3"
              type="email"
              name="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>
          <button className="store-button" disabled={sending}>
            {sending ? "Please wait…" : "Send secure access link"}
          </button>
          <p role="status">{recoveryMessage}</p>
        </form>
      )}
      <div className="mt-6 flex gap-5">
        <Link href="/shop">Continue shopping</Link>
        <Link href="/">Back to home</Link>
      </div>
    </section>
  );
}
