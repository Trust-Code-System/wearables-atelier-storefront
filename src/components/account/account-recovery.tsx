"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { accountAction, accountSession, type AccountSession } from "@/lib/account-api";

export function AccountRecovery({ mode }: { mode: "forgot" | "reset" | "verified" }) {
  const captured = useRef(false);
  const [token, setToken] = useState("");
  const [linkError, setLinkError] = useState(false);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<AccountSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!captured.current) {
    captured.current = true;
    setToken(params.get("token") ?? "");
    setLinkError(params.has("error"));
    setReady(true);
    // Remove the reset proof from the address bar/history after reading it.
    if (mode === "reset") window.history.replaceState(null, "", window.location.pathname);
    }
    let active = true;
    if (mode === "verified") void accountSession().then(value => { if (active) setSession(value); }).catch(() => {
      if (active) setMessage("Unable to check this browser’s session. Open sign in to check your account.");
    });
    return () => { active = false; };
  }, [mode]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || done) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    if (mode === "reset" && values.get("password") !== values.get("confirm")) {
      setMessage("Your passwords do not match."); return;
    }
    setBusy(true); setMessage("");
    try {
      if (mode === "forgot") {
        await accountAction("request-password-reset", { email: String(values.get("email") ?? "").trim() });
        setMessage("If an account exists for that email, we’ll send a password reset link. Check your inbox and spam folder.");
      } else {
        await accountAction("reset-password", { token, newPassword: String(values.get("password") ?? "") });
        setToken("");
        setMessage("Your password has been reset. Sign in with your new password.");
      }
      form.reset(); setDone(true);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to complete your request."); }
    finally { setBusy(false); }
  };
  const invalidReset = mode === "reset" && ready && (!token || linkError) && !done;
  return <section className="store-section account-page"><div className="account-content"><div className="customer-page-heading"><p className="store-label">Your atelier</p><h1>{mode === "forgot" ? "Forgot your password?" : mode === "reset" ? "Choose a new password." : "Email verification"}</h1></div>
    {mode === "verified" ? <>
      <p>{linkError ? "This verification link could not be completed. It may be invalid or expired. Request another email from the sign-in page." : "Your email verification link has been processed. Sign in to the account you verified to continue."}</p>
      {session && <p>This browser is currently signed in as {session.user.email}. Opening a verification link does not switch accounts. Use the sign-in page to sign out if this is not your account.</p>}
    </> : invalidReset ? <p>This reset link is missing, invalid or expired. Please request a new one.</p> : !done && <form onSubmit={submit}>
      {mode === "forgot" ? <label htmlFor="recovery-email">Email address<input id="recovery-email" name="email" type="email" autoComplete="email" maxLength={254} required /></label> : <>
        <label htmlFor="recovery-password">New password<input id="recovery-password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
        <label htmlFor="recovery-confirm">Confirm password<input id="recovery-confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
      </>}
      <button type="submit" className="store-button" disabled={busy || !ready}>{busy ? "Please wait…" : mode === "forgot" ? "Send reset link" : "Reset password"}</button>
    </form>}
    <p role="status" className="account-message">{message}</p>
    <div className="account-help"><Link href="/account/login">Back to sign in</Link><Link href="/">Back to home</Link>{mode !== "forgot" && <Link href="/account/forgot-password">Request a new reset link</Link>}</div>
  </div></section>;
}
