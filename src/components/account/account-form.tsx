"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { accountAction, accountSession, type AccountSession } from "@/lib/account-api";
import { brandContact } from "@/lib/brand-contact";

// Credentials go only to Better Auth; never persist them in browser storage.
export function AccountForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const router = useRouter();
  const [session, setSession] = useState<AccountSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    let revision = 0;
    const check = () => {
      const current = ++revision;
      void accountSession().then((value) => { if (active && current === revision) setSession(value); })
        .catch(() => { if (active && current === revision) setMessage("Unable to check your account. You can try signing in below."); })
        .finally(() => { if (active && current === revision) setChecking(false); });
    };
    const changed = () => { setSession(null); check(); };
    check();
    window.addEventListener("focus", check);
    window.addEventListener("wearables:account-changed", changed);
    return () => {
      active = false;
      window.removeEventListener("focus", check);
      window.removeEventListener("wearables:account-changed", changed);
    };
  }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true); setMessage("");
    try {
      await accountAction(register ? "sign-up/email" : "sign-in/email", {
        email: String(values.get("email") ?? "").trim(),
        password: String(values.get("password") ?? ""),
        ...(register ? { name: String(values.get("name") ?? "").trim() } : {}),
      });
      form.reset();
      const current = await accountSession();
      setSession(current);
      if (current) router.push("/wishlist");
      else setMessage("Your account was created. Check your email, then sign in to sync your wishlist.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to access your account. Please retry."); }
    finally { setBusy(false); }
  };
  const resend = async () => {
    const input = document.getElementById("account-email") as HTMLInputElement | null;
    if (!input?.reportValidity()) return;
    setBusy(true); setMessage("");
    try {
      await accountAction("send-verification-email", { email: input.value.trim() });
      setMessage("If your account needs verification, a link will be sent to your inbox.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to resend verification."); }
    finally { setBusy(false); }
  };
  const logout = async () => {
    setBusy(true); setMessage("");
    try { await accountAction("sign-out", {}); setSession(null); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to sign out."); }
    finally { setBusy(false); }
  };
  return <section className="store-section account-page"><div className="account-image"><Image src="/collection/look-01.png" alt="Lime Iro and Buba from the Ashabi collection" fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" /><p>A little more <em>you.</em></p></div><div className="account-content"><div className="customer-page-heading"><p className="store-label">Your atelier</p><h1>{register ? "Make yourself" : "Welcome"}<br /><em>{register ? "at home." : "back."}</em></h1><p>{register ? "One place for your favourite pieces and future orders." : "Your favourites, your style, your next occasion."}</p></div><p className="account-notice">{session ? `Signed in as ${session.user.email}. Your wishlist is saved to your account.` : "Sign in to save your favourites across devices. Your guest wishlist will be brought with you."}</p>{session ? <div><p>Welcome, {session.user.name}.</p><Link href="/wishlist" className="store-button">View your wishlist</Link><button type="button" className="store-text-link" disabled={busy} onClick={() => { void logout(); }}>Sign out</button><p role="status" className="account-message">{message}</p></div> : <form onSubmit={submit}>
  {register && <label htmlFor="account-name">Your name<input id="account-name" name="name" autoComplete="name" maxLength={120} required /></label>}
  <label htmlFor="account-email">Email address<input id="account-email" name="email" maxLength={254} type="email" autoComplete="email" required /></label>
  <div className="account-field"><label htmlFor="account-password">Password</label><span className="account-password"><input id="account-password" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} minLength={register ? 12 : 1} maxLength={128} required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}</button></span></div>
  {!register && <Link href="/account/forgot-password" className="store-text-link">Forgot password?</Link>}
  <button type="submit" className="store-button" disabled={busy || checking}>{busy ? "Please wait…" : register ? "Create account" : "Sign in"}<ArrowUpRight size={18} aria-hidden /></button><p role="status" className="account-message">{checking ? "Checking your account…" : message}</p><button type="button" className="store-text-link" disabled={busy || checking} onClick={() => { void resend(); }}>Resend verification email</button></form>}<p className="account-switch">{register ? "Already part of the atelier?" : "New to the atelier?"} <Link href={register ? "/account/login" : "/account/register"}>{register ? "Sign in" : "Create an account"}</Link></p><div className="account-help"><Link href="/">Back to home</Link><Link href="/wishlist">View your wishlist</Link><a href={brandContact.whatsapp} target="_blank" rel="noopener noreferrer">Need a hand? Contact us <ArrowUpRight size={13} aria-hidden /></a></div></div></section>;
}
