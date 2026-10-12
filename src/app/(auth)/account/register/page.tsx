import type { Metadata } from "next";
import { AccountForm } from "@/components/account/account-form";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return <AccountForm mode="register" />;
}
