import type { Metadata } from "next";
import { OrderStatus } from "@/components/checkout/order-status";
export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
// Provider query parameters are deliberately not used as proof or payment status.
export default function Page() {
  return <OrderStatus />;
}
