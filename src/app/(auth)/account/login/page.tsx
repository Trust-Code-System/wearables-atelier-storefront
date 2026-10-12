import type { Metadata } from "next";
import { AccountForm } from "@/components/account/account-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <AccountForm mode="login" />;
}
