import type { Metadata } from "next";
import { AccountRecovery } from "@/components/account/account-recovery";
export const metadata: Metadata = { title: "Email verification", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function Page() { return <AccountRecovery mode="verified" />; }
