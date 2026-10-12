import type { Metadata } from "next";
import { AccountForm } from "@/components/account/account-form";
export const metadata: Metadata = { title: "Your account" };
export default function AccountPage() { return <AccountForm mode="login" />; }
