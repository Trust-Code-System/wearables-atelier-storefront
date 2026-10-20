import type { Metadata } from "next";
import { OrderAccess } from "@/components/checkout/order-access";
export const metadata: Metadata = {
  title: "Order access",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function Page() {
  return <OrderAccess />;
}
