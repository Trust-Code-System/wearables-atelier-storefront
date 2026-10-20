"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { OrderStatus } from "./order-status";
import { storeRequest } from "@/lib/checkout-api";

export function OrderAccess() {
  const captured = useRef(false);
  const [proof, setProof] = useState<{ orderId: string; token: string } | null>(
    null,
  );
  const [orderId, setOrderId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (captured.current) return;
    captured.current = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const id = params.get("orderId"),
      token = params.get("token");
    window.history.replaceState(null, "", window.location.pathname);
    if (
      id &&
      /^[0-9a-f-]{36}$/i.test(id) &&
      token &&
      /^[A-Za-z0-9_-]{43}$/.test(token)
    ) {
      // The proof exists only in the browser fragment. Capture it once after
      // hydration, then immediately remove it from history before any request.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProof({ orderId: id, token });
    } else
      setMessage(
        "This link is missing or invalid. Request a new secure access email.",
      );
  }, []);
  if (orderId) return <OrderStatus orderId={orderId} />;
  return (
    <section className="store-section mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-5 font-display text-3xl">View your order securely</h1>
      <p>
        Confirm below to open this order on your browser. Keep the email link
        private.
      </p>
      {proof && (
        <button
          type="button"
          className="store-button mt-5"
          disabled={busy}
          onClick={async () => {
            if (busy) return;
            setBusy(true);
            setMessage("");
            try {
              const result = await storeRequest<{ orderId: string }>(
                "orders/access/redeem",
                "POST",
                proof,
              );
              setProof(null);
              setOrderId(result.orderId);
            } catch {
              setMessage(
                "This link could not be used. It may be expired or already used. Request a new access email.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Please wait…" : "Confirm access to my order"}
        </button>
      )}
      <p role="status" className="my-5">
        {message}
      </p>
      <Link className="underline" href="/checkout/return">
        Request another access email
      </Link>
      <Link className="ml-5 underline" href="/">
        Back to home
      </Link>
    </section>
  );
}
