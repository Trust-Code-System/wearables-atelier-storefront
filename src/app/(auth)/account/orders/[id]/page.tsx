import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatus } from "@/components/checkout/order-status";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };
export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <><div className="store-section pb-0"><Link href="/account" className="store-text-link">Back to your account</Link></div><OrderStatus orderId={id} /></>;
}
