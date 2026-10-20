"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Heart,
  Info,
  LockKeyhole,
  Mail,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accountAction, accountSession } from "@/lib/account-api";
import { useAccountSession } from "./use-account-session";

import "./auth.css";

const LOOKS = [
  {
    src: "/collection/look-01.png",
    alt: "Lime Iro and Buba, matching gele and an embroidered sash by Ashabi",
    title: "The art of showing up.",
    category: "Iro & Buba / The Ashabi edit",
    position: "50% 36%",
  },
  {
    src: "/collection/look-06.png",
    alt: "Rust occasionwear paired with a teal gele and sash by Ashabi",
    title: "A moment. Made yours.",
    category: "Occasionwear / The Ashabi edit",
    position: "50% 35%",
  },
];

type Mode = "login" | "register";
type Fields = { name: string; email: string; password: string };

/** Passwords remain in memory and travel only to the configured Better Auth service. */
function AuthFields({ mode, keyboard }: { mode: Mode; keyboard: boolean }) {
  const register = mode === "register";
  const formRef = useRef<HTMLFormElement>(null);
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const router = useRouter();
  const { session, loading: checking } = useAccountSession();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (session) router.replace("/account");
  }, [session, router]);
  const update = (field: keyof Fields, value: string) => {
    setFields((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || checking) return;
    const next: Partial<Fields> = {};
    if (register && fields.name.trim().length < 2)
      next.name = "Tell us your name, using at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
      next.email = "Enter a valid email address.";
    if (!fields.password) next.password = "Enter your password.";
    else if (register && fields.password.length < 12)
      next.password = "Use at least 12 characters.";
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await accountAction(register ? "sign-up/email" : "sign-in/email", {
        email: fields.email.trim(),
        password: fields.password,
        ...(register ? { name: fields.name.trim() } : {}),
      });
      setFields((previous) => ({ ...previous, password: "" }));
      setVisible(false);
      const current = await accountSession();
      if (current) router.replace("/account");
      else
        setMessage(
          register
            ? "Your account is created. Check your inbox to verify your email, then sign in."
            : "We couldn’t confirm your session. Please verify your email and try again.",
        );
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Unable to access your account. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      setErrors((previous) => ({
        ...previous,
        email: "Enter your email address first.",
      }));
      formRef.current?.querySelector<HTMLInputElement>("#auth-email")?.focus();
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await accountAction("send-verification-email", {
        email: fields.email.trim(),
      });
      setMessage(
        "If your account needs verification, a link will be sent to your inbox.",
      );
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Unable to send verification. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-form-content" data-keyboard={keyboard}>
      <div className="auth-heading">
        <p className="auth-eyebrow">
          <span />
          Your personal atelier
        </p>
        <h1 id="auth-title">
          {register ? (
            <>
              A little more
              <br />
              <em>you.</em>
            </>
          ) : (
            <>
              Welcome
              <br />
              <em>back.</em>
            </>
          )}
        </h1>
        <p>
          {register
            ? "Make room for the pieces and moments you love."
            : "Your favourite pieces. Your next occasion. All a little closer."}
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={submit}
        noValidate
        aria-label={register ? "Create an account" : "Sign in"}
        aria-describedby="auth-account-note"
      >
        {register && (
          <div className="auth-field">
            <Label htmlFor="auth-name">Full name</Label>
            <Input
              id="auth-name"
              maxLength={120}
              name="name"
              autoComplete="name"
              placeholder="Your full name"
              value={fields.name}
              onChange={(event) => update("name", event.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "auth-name-error" : undefined}
              required
            />
            {errors.name && (
              <p id="auth-name-error" className="auth-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>
        )}
        <div className="auth-field">
          <Label htmlFor="auth-email">Email address</Label>
          <div className="auth-input-wrap">
            <Mail size={18} aria-hidden />
            <Input
              id="auth-email"
              maxLength={254}
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              value={fields.email}
              onChange={(event) => update("email", event.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "auth-email-error" : undefined}
              required
            />
          </div>
          {errors.email && (
            <p id="auth-email-error" className="auth-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>
        <div className="auth-field">
          <div className="auth-field-heading">
            <Label htmlFor="auth-password">Password</Label>
            {!register && (
              <Link href="/account/forgot-password" className="auth-forgot">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="auth-input-wrap auth-password-wrap">
            <LockKeyhole size={18} aria-hidden />
            <Input
              id="auth-password"
              maxLength={128}
              name="password"
              type={visible ? "text" : "password"}
              autoComplete={register ? "new-password" : "current-password"}
              placeholder={
                register ? "Create a password" : "Enter your password"
              }
              value={fields.password}
              onChange={(event) => update("password", event.target.value)}
              onKeyUp={(event) =>
                setCapsLock(event.getModifierState("CapsLock"))
              }
              onBlur={() => setCapsLock(false)}
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password
                  ? "auth-password-error"
                  : register
                    ? "auth-password-help"
                    : undefined
              }
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="auth-password-toggle"
              onClick={() => setVisible((previous) => !previous)}
              aria-label={visible ? "Hide password" : "Show password"}
              aria-pressed={visible}
            >
              {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            </Button>
          </div>
          {errors.password ? (
            <p id="auth-password-error" className="auth-error" role="alert">
              {errors.password}
            </p>
          ) : (
            register && (
              <p id="auth-password-help" className="auth-password-hint">
                <span data-complete={fields.password.length >= 12}>
                  {fields.password.length >= 12 ? (
                    <Check size={13} aria-hidden />
                  ) : (
                    <span className="auth-hint-dot" />
                  )}
                </span>
                At least 12 characters
              </p>
            )
          )}
          {capsLock && (
            <p className="auth-password-hint" role="status">
              Caps Lock is on
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="auth-submit"
          disabled={busy || checking || !!session}
        >
          <span>
            {busy
              ? "Please wait…"
              : checking
                ? "Checking your account…"
                : register
                  ? "Create an account"
                  : "Sign in"}
          </span>
          {busy ? (
            <LoaderCircle
              className="animate-spin motion-reduce:animate-none"
              aria-hidden
            />
          ) : (
            <ArrowRight aria-hidden />
          )}
        </Button>
        <p role="status" className="auth-account-message">
          {message}
        </p>
        <button
          type="button"
          className="auth-forgot"
          disabled={busy || checking}
          onClick={() => {
            void resend();
          }}
        >
          Resend verification email
        </button>
      </form>

      <div className="auth-preview-note" id="auth-account-note">
        <Info size={15} aria-hidden />
        <p>
          Your favourites, orders and delivery details, together in your
          account. Your password is never saved in browser storage.
        </p>
      </div>
      <div className="auth-guest-divider">
        <span />
        Or, make yourself at home
        <span />
      </div>
      <Link href="/shop" className="auth-guest">
        Continue as a guest
        <ArrowUpRight size={17} aria-hidden />
      </Link>
      <p className="auth-legal">
        Explore our <Link href="/privacy">privacy policy</Link> and{" "}
        <Link href="/terms">terms of service</Link>.
      </p>
    </div>
  );
}

export function AuthExperience() {
  const pathname = usePathname();
  const mode: Mode = pathname.endsWith("/register") ? "register" : "login";
  const reduce = useReducedMotion();
  const [keyboard, setKeyboard] = useState(false);
  const [look, setLook] = useState(0);
  const current = LOOKS[look];

  return (
    <section className="auth-page" aria-labelledby="auth-title">
      <div className="auth-topline">
        <Link href="/shop">
          <ArrowLeft size={15} aria-hidden />
          Back to the collection
        </Link>
        <span>Culture. Luxury. Elegance.</span>
      </div>
      <div className="auth-composition">
        <aside className="auth-editorial" aria-label="The Ashabi edit">
          <AnimatePresence initial={false}>
            <motion.div
              key={look}
              className="auth-editorial-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.28 }}
            >
              <Image
                src={current.src}
                alt={current.alt}
                fill
                priority={look === 0}
                sizes="(min-width: 1440px) 650px, (min-width: 768px) 48vw, 100vw"
                style={{ objectPosition: current.position }}
              />
            </motion.div>
          </AnimatePresence>
          <div className="auth-editorial-top">
            <span className="auth-collection-label">The Ashabi edit</span>
            <Link
              href="/wishlist"
              className="auth-save-edit"
              aria-label="Open your wishlist"
            >
              <Heart size={19} aria-hidden />
            </Link>
          </div>
          <div className="auth-editorial-caption">
            <p className="auth-eyebrow">For every version of you</p>
            <h2>
              {look === 0 ? (
                <>
                  The art of
                  <br />
                  <em>showing up.</em>
                </>
              ) : (
                <>
                  A moment.
                  <br />
                  <em>Made yours.</em>
                </>
              )}
            </h2>
            <div className="auth-editorial-bottom">
              <p aria-live="polite">{current.category}</p>
              <div
                className="auth-look-controls"
                role="group"
                aria-label="Collection photos"
              >
                {LOOKS.map((item, index) => (
                  <button
                    key={item.src}
                    type="button"
                    aria-label={`Show collection photo ${index + 1}`}
                    aria-pressed={index === look}
                    onClick={() => setLook(index)}
                  >
                    <span />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-panel-top">
            <span className="auth-access-mark">
              <span />
              The atelier / Account
            </span>
            <span className="auth-preview-badge">Your account</span>
          </div>
          <nav
            className="auth-segment"
            aria-label="Account access"
            onPointerDown={() => setKeyboard(false)}
            onKeyDown={() => setKeyboard(true)}
          >
            {(["login", "register"] as const).map((item) => (
              <Link
                key={item}
                href={`/account/${item}`}
                scroll={false}
                aria-current={mode === item ? "page" : undefined}
              >
                {mode === item && (
                  <motion.span
                    layoutId="auth-segment-indicator"
                    className="auth-segment-indicator"
                    aria-hidden
                    transition={
                      reduce || keyboard
                        ? { duration: 0 }
                        : { type: "spring", duration: 0.28, bounce: 0.08 }
                    }
                  />
                )}
                <span>
                  {item === "login" ? "Sign in" : "Create an account"}
                </span>
              </Link>
            ))}
          </nav>
          <AuthFields key={mode} mode={mode} keyboard={keyboard} />
        </div>
      </div>
      <div className="auth-bottomline">
        <span>Made with intention. Worn with confidence.</span>
        <Link href="/contact">
          Need a hand?
          <ArrowUpRight size={14} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
