"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { brandContact } from "@/lib/brand-contact";

// Presentational forms only. No credential storage or simulated authentication.
export function AccountForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  return <section className="store-section account-page"><div className="account-image"><Image src="/collection/look-01.png" alt="Lime Iro and Buba from the Ashabi collection" fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" /><p>A little more <em>you.</em></p></div><div className="account-content"><div className="customer-page-heading"><p className="store-label">Your atelier</p><h1>{register ? "Make yourself" : "Welcome"}<br /><em>{register ? "at home." : "back."}</em></h1><p>{register ? "One place for your favourite pieces and future orders." : "Your favourites, your style, your next occasion."}</p></div><p className="account-notice">Online accounts are coming soon. For now, you can save a wishlist on this device and shop without an account.</p><form onSubmit={(event) => { event.preventDefault(); event.currentTarget.reset(); setMessage("Account access isn’t available yet. Please use guest checkout or contact the atelier for help."); }}>
  {register && <label htmlFor="account-name">Your name<input id="account-name" name="name" autoComplete="name" required /></label>}
  <label htmlFor="account-email">Email address<input id="account-email" name="email" type="email" autoComplete="email" required /></label>
  <div className="account-field"><label htmlFor="account-password">Password</label><span className="account-password"><input id="account-password" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} minLength={8} required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}</button></span></div>
  <button type="submit" className="store-button">{register ? "Create account" : "Sign in"}<ArrowUpRight size={18} aria-hidden /></button><p role="status" className="account-message">{message}</p></form><p className="account-switch">{register ? "Already part of the atelier?" : "New to the atelier?"} <Link href={register ? "/account/login" : "/account/register"}>{register ? "Sign in" : "Create an account"}</Link></p><div className="account-help"><Link href="/wishlist">View your wishlist</Link><a href={brandContact.whatsapp} target="_blank" rel="noopener noreferrer">Need a hand? Contact us <ArrowUpRight size={13} aria-hidden /></a></div></div></section>;
}
