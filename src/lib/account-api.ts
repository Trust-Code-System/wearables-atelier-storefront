import { getApiBaseUrl } from "./api-config";
export type AccountSession = {
  user: { id: string; name: string; email: string };
};
export async function accountSession(): Promise<AccountSession | null> {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/get-session`, {
    credentials: "include",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new Error("Unable to check your account. Please try again.");
  const value = (await response.json()) as AccountSession | null;
  if (value !== null && (!value.user || typeof value.user.id !== "string"))
    throw new Error("Unable to check your account.");
  return value;
}
export function accountChanged() {
  window.dispatchEvent(new Event("wearables:account-changed"));
}
export async function accountAction(
  action: "sign-in/email" | "sign-up/email" | "sign-out",
  body: object,
) {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/${action}`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    if (response.status === 429)
      throw new Error("Please wait a moment before trying again.");
    if (action === "sign-in/email")
      throw new Error("Unable to sign in. Check your email and password.");
    throw new Error(
      action === "sign-out"
        ? "Unable to sign out. Please try again."
        : "Unable to create your account. Check your details or try signing in.",
    );
  }
  accountChanged();
}
