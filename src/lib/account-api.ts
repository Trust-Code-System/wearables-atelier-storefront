import { getApiBaseUrl } from "./api-config";
export type AccountSession = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
    image?: string | null;
  };
};
export async function accountSession(): Promise<AccountSession | null> {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/get-session`, {
    credentials: "include",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  }).catch(() => {
    throw new Error("We couldn’t connect to accounts. Please try again.");
  });
  if (response.status === 401) return null;
  if (!response.ok)
    throw new Error("Unable to check your account. Please try again.");
  const value = (await response.json()) as AccountSession | null;
  if (
    value !== null &&
    (!value.user ||
      typeof value.user.id !== "string" ||
      typeof value.user.name !== "string" ||
      typeof value.user.email !== "string")
  )
    throw new Error("Unable to check your account.");
  return value;
}
export function accountChanged() {
  window.dispatchEvent(new Event("wearables:account-changed"));
}
export async function accountAction(
  action:
    | "sign-in/email"
    | "sign-up/email"
    | "sign-out"
    | "request-password-reset"
    | "reset-password"
    | "send-verification-email",
  body: object,
) {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/${action}`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {
    throw new Error("We couldn’t connect to accounts. Please try again.");
  });
  if (!response.ok) {
    if (response.status === 429)
      throw new Error("Please wait a moment before trying again.");
    const detail = (await response.json().catch(() => null)) as { code?: string } | null;
    // A 5xx, or a bare 403 with no account error code, means the service refused
    // the request; blaming the customer's password would be wrong.
    const serviceFailure = response.status >= 500 || (response.status === 403 && !detail?.code);
    if (serviceFailure)
      throw new Error("We could not complete this right now. Nothing was changed. Please try again in a minute.");
    if (action === "sign-in/email")
      throw new Error(
        "We could not sign you in. Check your email and password. If you have just created an account, verify your email first: use “Send the verification email again” below.",
      );
    if (action === "reset-password")
      throw new Error(
        "This reset link may be invalid or expired. Request a new link and try again.",
      );
    if (
      action === "request-password-reset" ||
      action === "send-verification-email"
    )
      throw new Error("Unable to send the email. Please try again shortly.");
    throw new Error(
      action === "sign-out"
        ? "Unable to sign out. Please try again."
        : "Unable to create your account. Check your details or try signing in.",
    );
  }
  if (
    ["sign-in/email", "sign-up/email", "sign-out", "reset-password"].includes(
      action,
    )
  )
    accountChanged();
}
