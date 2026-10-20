"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Tabs } from "@base-ui/react/tabs";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Heart,
  LockKeyhole,
  MapPin,
  Plus,
  Ruler,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { accountAction, type AccountSession } from "@/lib/account-api";
import {
  customerAddresses,
  customerOrders,
  customerProfile,
  customerRequest,
  NIGERIAN_STATES,
  type AddressInput,
  type SavedAddress,
} from "@/lib/customer-api";
import { cartNaira } from "@/lib/cart-api";
import { formatPrice } from "@/lib/format";
import { brandContact } from "@/lib/brand-contact";
import { useAccountSession } from "./use-account-session";
import "./account-dashboard.css";

const TABS = [
  "Overview",
  "Orders",
  "Addresses",
  "Measurements",
  "Avatar",
  "Password",
  "Email",
];
const friendly = (cause: unknown) =>
  cause instanceof Error
    ? cause.message
    : "Something went wrong. Please try again.";
const words = (value: string) => value.replaceAll("_", " ");

function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<{
    owner: typeof load;
    data: T | null;
    error: string;
    loading: boolean;
  }>({ owner: load, data: null, error: "", loading: true });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ owner: load, data, error: "", loading: false });
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setState({
            owner: load,
            data: null,
            error: friendly(cause),
            loading: false,
          });
      });
    return () => controller.abort();
  }, [load, retry]);
  const refresh = () => {
    setState({ owner: load, data: null, error: "", loading: true });
    setRetry((value) => value + 1);
  };
  return {
    ...(state.owner === load
      ? state
      : { data: null, error: "", loading: true }),
    refresh,
  };
}

function Loading({ text = "Opening your atelier…" }: { text?: string }) {
  return (
    <div className="account-atelier-loading" role="status">
      <span aria-hidden />
      <p>{text}</p>
    </div>
  );
}
function Problem({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="account-atelier-problem">
      <p role="alert">{message}</p>
      <Button variant="outline" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}

export function AccountDashboard() {
  const { session, loading, error, refresh } = useAccountSession();
  if (loading)
    return (
      <section className="account-atelier-page">
        <Loading />
      </section>
    );
  if (error)
    return (
      <section className="account-atelier-page">
        <Problem message={error} retry={refresh} />
        <Link href="/account/login" className="store-text-link">
          Back to sign in <ArrowRight size={16} aria-hidden />
        </Link>
      </section>
    );
  if (!session)
    return (
      <section className="account-atelier-page account-atelier-guest">
        <p className="store-label">Your personal atelier</p>
        <h1>
          A little more <em>you.</em>
        </h1>
        <p>
          Sign in to keep your favourites, delivery details and orders together.
        </p>
        <div>
          <Button render={<Link href="/account/login" />}>
            Sign in
            <ArrowRight size={16} aria-hidden />
          </Button>
          <Button variant="outline" render={<Link href="/account/register" />}>
            Create an account
          </Button>
        </div>
        <Link href="/shop" className="store-text-link">
          Continue exploring <ArrowUpRight size={16} aria-hidden />
        </Link>
      </section>
    );
  return <AccountWorkspace key={session.user.id} session={session} />;
}

function AccountWorkspace({ session }: { session: AccountSession }) {
  const [tab, setTab] = useState("Overview");
  const profile = useResource(customerProfile);
  const addresses = useResource(customerAddresses);
  const [cursor, setCursor] = useState<string>();
  const [history, setHistory] = useState<(string | undefined)[]>([]);
  const readOrders = useCallback(
    (signal: AbortSignal) => customerOrders(cursor, signal),
    [cursor],
  );
  const orders = useResource(readOrders);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const actions = useRef<AbortController | null>(null);
  useEffect(() => {
    actions.current = new AbortController();
    return () => actions.current?.abort();
  }, []);
  async function perform(
    work: (signal: AbortSignal) => Promise<void>,
    success = "",
  ) {
    if (busy || !actions.current) return;
    const controller = actions.current;
    setBusy(true);
    setMessage("");
    try {
      await work(controller.signal);
      if (!controller.signal.aborted) setMessage(success);
    } catch (cause) {
      if (!controller.signal.aborted) setMessage(friendly(cause));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  const verified = session.user.emailVerified === true;
  const defaultAddress = addresses.data?.data.find(
    (address) => address.isDefault,
  );
  const initials = session.user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <section className="account-atelier-page">
      <nav className="account-atelier-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden>/</span>
        <span>Your account</span>
      </nav>
      <header className="account-atelier-hero">
        <div className="account-atelier-intro">
          <p className="store-label">Your personal atelier</p>
          <h1>
            {session.user.name || "Welcome back"}
            <span>Make yourself at home.</span>
          </h1>
          <p>
            Your orders, delivery details and favourite pieces, all in one
            place.
          </p>
          <span className="account-atelier-identity">
            <UserRound size={14} aria-hidden />
            {session.user.email}
          </span>
        </div>
        <div className="account-atelier-portrait">
          <Image
            src="/collection/look-06.png"
            alt="Ashabi occasionwear in rust and teal"
            fill
            priority
            sizes="(min-width: 768px) 35vw, 100vw"
          />
          <span>For every version of you.</span>
        </div>
      </header>

      <Tabs.Root
        value={tab}
        onValueChange={(value) => {
          if (typeof value === "string") {
            setTab(value);
            setMessage("");
          }
        }}
        className="account-atelier-tabs"
      >
        <Tabs.List
          className="account-atelier-tab-list"
          aria-label="Your account"
        >
          {TABS.map((name) => (
            <Tabs.Tab key={name} value={name}>
              {name}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <div className="account-atelier-account-body">
          {!verified && (
            <div className="account-atelier-verification">
              <div>
                <p>One small step for your account.</p>
                <span>
                  Verify your email to save contact details and delivery
                  addresses.
                </span>
              </div>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  void perform(
                    () =>
                      accountAction("send-verification-email", {
                        email: session.user.email,
                      }),
                    "If verification is needed, a link will be sent to your inbox.",
                  );
                }}
              >
                Send verification link
              </Button>
            </div>
          )}
          {message && (
            <p className="account-atelier-feedback" role="status">
              {message}
            </p>
          )}

          <Tabs.Panel value="Overview" className="account-atelier-panel">
            <div className="account-atelier-panel-heading">
              <div>
                <p className="store-label">The essentials</p>
                <h2>Your details, thoughtfully kept.</h2>
              </div>
              <span className="account-atelier-verified">
                {verified ? (
                  <Check size={14} aria-hidden />
                ) : (
                  <LockKeyhole size={14} aria-hidden />
                )}
                {verified ? "Email verified" : "Verification needed"}
              </span>
            </div>
            <div className="account-atelier-overview-grid">
              <div className="account-atelier-details">
                <dl>
                  <div>
                    <dt>Name</dt>
                    <dd>{session.user.name}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{session.user.email}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{profile.data?.phone || "Not added yet"}</dd>
                  </div>
                </dl>
                {profile.loading ? (
                  <Loading text="Loading your contact details…" />
                ) : profile.error ? (
                  <Problem message={profile.error} retry={profile.refresh} />
                ) : (
                  <form
                    className="account-atelier-phone"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = event.currentTarget;
                      const phone = String(
                        new FormData(form).get("phone") ?? "",
                      ).trim();
                      void perform(async (signal) => {
                        await customerRequest("customers/me", {
                          method: "PATCH",
                          body: { phone: phone || null },
                          signal,
                        });
                        profile.refresh();
                      }, "Your phone number has been saved.");
                    }}
                  >
                    <Label htmlFor="account-atelier-phone">Contact phone</Label>
                    <div>
                      <Input
                        id="account-atelier-phone"
                        key={profile.data?.phone}
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        maxLength={32}
                        defaultValue={profile.data?.phone ?? ""}
                        placeholder="+234 801 234 5678"
                        disabled={!verified || busy}
                      />
                      <Button type="submit" disabled={!verified || busy}>
                        Save phone
                      </Button>
                    </div>
                    <p>Leave blank to remove your saved number.</p>
                  </form>
                )}
              </div>
              <div className="account-atelier-address-summary">
                <MapPin size={23} strokeWidth={1.4} aria-hidden />
                <h3>Your usual destination.</h3>
                {addresses.loading ? (
                  <Loading text="Loading your address…" />
                ) : addresses.error ? (
                  <Problem
                    message={addresses.error}
                    retry={addresses.refresh}
                  />
                ) : defaultAddress ? (
                  <p>
                    {defaultAddress.recipientName}
                    <br />
                    {defaultAddress.line1}
                    <br />
                    {defaultAddress.city}, {defaultAddress.state}
                  </p>
                ) : (
                  <p>Save a delivery address for your next occasion.</p>
                )}
                <Button variant="outline" onClick={() => setTab("Addresses")}>
                  Manage addresses
                  <ArrowUpRight size={15} aria-hidden />
                </Button>
              </div>
            </div>
            <div className="account-atelier-shortcuts">
              <button onClick={() => setTab("Orders")}>
                <ShoppingBag size={22} strokeWidth={1.3} aria-hidden />
                <span>
                  Your orders<small>Every piece, every occasion.</small>
                </span>
                <ArrowUpRight size={17} aria-hidden />
              </button>
              <Link href="/wishlist">
                <Heart size={22} strokeWidth={1.3} aria-hidden />
                <span>
                  Your favourites<small>A little something you love.</small>
                </span>
                <ArrowUpRight size={17} aria-hidden />
              </Link>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="Orders" className="account-atelier-panel">
            <div className="account-atelier-panel-heading">
              <div>
                <p className="store-label">Your collection, in the making</p>
                <h2>Your orders.</h2>
              </div>
              <Link href="/shop" className="store-text-link">
                Explore the collection
                <ArrowUpRight size={16} aria-hidden />
              </Link>
            </div>
            {orders.loading ? (
              <Loading text="Finding your orders…" />
            ) : orders.error ? (
              <Problem message={orders.error} retry={orders.refresh} />
            ) : orders.data?.data.length ? (
              <>
                <div className="account-atelier-order-list">
                  {orders.data.data.map((order) => (
                    <Link
                      href={`/account/orders/${encodeURIComponent(order.id)}`}
                      key={order.id}
                      className="account-atelier-order"
                    >
                      <span className="account-atelier-order-icon">
                        <ShoppingBag size={22} strokeWidth={1.3} aria-hidden />
                      </span>
                      <span>
                        <strong>{order.number}</strong>
                        <small>
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-NG",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}
                        </small>
                      </span>
                      <span className="account-atelier-order-status">
                        <strong>{words(order.paymentStatus)}</strong>
                        <small>{words(order.fulfilmentStatus)}</small>
                      </span>
                      <span className="account-atelier-order-total">
                        {formatPrice(cartNaira(order.totalKobo), "NGN")}
                        <ArrowUpRight size={16} aria-hidden />
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="account-atelier-pagination">
                  <Button
                    variant="outline"
                    disabled={!history.length}
                    onClick={() => {
                      setCursor(history.at(-1));
                      setHistory((previous) => previous.slice(0, -1));
                    }}
                  >
                    Previous
                  </Button>
                  <span>Page {history.length + 1}</span>
                  <Button
                    variant="outline"
                    disabled={!orders.data.meta.nextCursor}
                    onClick={() => {
                      setHistory((previous) => [...previous, cursor]);
                      setCursor(orders.data?.meta.nextCursor ?? undefined);
                    }}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <Empty
                icon={<ShoppingBag size={29} strokeWidth={1.3} />}
                title="Your first occasion awaits."
                text="Orders placed with this account will appear here."
              />
            )}
            <p className="account-atelier-small-note">
              Placed an order as a guest?{" "}
              <Link href="/orders/access">Recover access by email.</Link> Guest
              orders are kept separate from your account unless securely linked.
            </p>
          </Tabs.Panel>

          <Tabs.Panel value="Addresses" className="account-atelier-panel">
            <Addresses
              key={session.user.id}
              verified={verified}
              resource={addresses}
            />
          </Tabs.Panel>
          <Tabs.Panel value="Measurements" className="account-atelier-panel">
            <Empty
              icon={<Ruler size={29} strokeWidth={1.3} />}
              title="Made to feel like you."
              text="Saved measurements aren’t available yet. For sizing or a custom fit, speak with the atelier."
              contact
            />
          </Tabs.Panel>
          <Tabs.Panel value="Avatar" className="account-atelier-panel">
            <div className="account-atelier-avatar" aria-hidden>
              {initials || "A"}
            </div>
            <Empty
              title="A personal touch."
              text="Your initials identify your account for now. Photo uploads aren’t available yet."
            />
          </Tabs.Panel>
          <Tabs.Panel value="Password" className="account-atelier-panel">
            <Empty
              icon={<LockKeyhole size={29} strokeWidth={1.3} />}
              title="Keep your atelier yours."
              text="Use a secure email link to reset your password. Resetting it signs out your existing sessions."
              action={
                <Button render={<Link href="/account/forgot-password" />}>
                  Request a reset link
                  <ArrowRight size={16} aria-hidden />
                </Button>
              }
            />
          </Tabs.Panel>
          <Tabs.Panel value="Email" className="account-atelier-panel">
            <div className="account-atelier-panel-heading">
              <div>
                <p className="store-label">Your inbox, your connection</p>
                <h2>Your email.</h2>
              </div>
            </div>
            <div className="account-atelier-email">
              <Label>Account email</Label>
              <p>{session.user.email}</p>
              <span>{verified ? "Verified" : "Awaiting verification"}</span>
            </div>
            <p className="account-atelier-small-note">
              Email changes aren’t available yet. Contact the atelier if you
              need help accessing your account.
            </p>
          </Tabs.Panel>
        </div>
      </Tabs.Root>
      <footer className="account-atelier-account-footer">
        <a
          href={brandContact.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
        >
          A little help from the atelier
          <ArrowUpRight size={15} aria-hidden />
        </a>
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() => {
            void perform(() => accountAction("sign-out", {}));
          }}
        >
          Sign out
          <ArrowRight size={15} aria-hidden />
        </Button>
      </footer>
    </section>
  );
}

function Empty({
  icon,
  title,
  text,
  action,
  contact = false,
}: {
  icon?: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
  contact?: boolean;
}) {
  return (
    <div className="account-atelier-empty">
      {icon && <span aria-hidden>{icon}</span>}
      <h3>{title}</h3>
      <p>{text}</p>
      {action ??
        (contact ? (
          <Button
            variant="outline"
            render={
              <a
                href={brandContact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Ask the atelier
            <ArrowUpRight size={16} aria-hidden />
          </Button>
        ) : (
          <Button variant="outline" render={<Link href="/shop" />}>
            Explore the collection
            <ArrowUpRight size={16} aria-hidden />
          </Button>
        ))}
    </div>
  );
}

function Addresses({
  verified,
  resource,
}: {
  verified: boolean;
  resource: ReturnType<
    typeof useResource<Awaited<ReturnType<typeof customerAddresses>>>
  >;
}) {
  const [editor, setEditor] = useState<SavedAddress | "new" | null>(null);
  const [removing, setRemoving] = useState<SavedAddress | null>(null);
  const [editorBusy, setEditorBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const operation = useRef<AbortController | null>(null);
  useEffect(() => {
    operation.current = new AbortController();
    return () => operation.current?.abort();
  }, []);
  async function mutate(path: string, method: "PATCH" | "DELETE") {
    if (busy || !operation.current) return;
    const controller = operation.current;
    setBusy(true);
    setError("");
    try {
      await customerRequest(path, {
        method,
        body: {},
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setRemoving(null);
        resource.refresh();
      }
    } catch (cause) {
      if (!controller.signal.aborted) setError(friendly(cause));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  return (
    <>
      <div className="account-atelier-panel-heading">
        <div>
          <p className="store-label">Somewhere familiar</p>
          <h2>Your addresses.</h2>
          <p>Save up to five addresses in Nigeria.</p>
        </div>
        <Button
          variant="outline"
          disabled={
            !verified ||
            busy ||
            resource.loading ||
            !resource.data ||
            resource.data.data.length >= 5
          }
          onClick={() => setEditor("new")}
        >
          <Plus size={16} aria-hidden />
          Add address
        </Button>
      </div>
      {error && (
        <p role="alert" className="account-atelier-feedback">
          {error}
        </p>
      )}
      {resource.loading ? (
        <Loading text="Loading your addresses…" />
      ) : resource.error ? (
        <Problem message={resource.error} retry={resource.refresh} />
      ) : resource.data?.data.length ? (
        <div className="account-atelier-address-grid">
          {resource.data.data.map((address) => (
            <article key={address.id} className="account-atelier-address-card">
              <div>
                <MapPin size={20} strokeWidth={1.3} aria-hidden />
                {address.isDefault && (
                  <span className="account-atelier-verified">
                    <Check size={12} aria-hidden />
                    Default
                  </span>
                )}
              </div>
              <h3>{address.recipientName}</h3>
              <p>
                {address.line1}
                {address.line2 && (
                  <>
                    <br />
                    {address.line2}
                  </>
                )}
                <br />
                {address.city}, {address.state}
                {address.lga && (
                  <>
                    <br />
                    {address.lga}
                  </>
                )}
                <br />
                Nigeria
              </p>
              <p>{address.phone}</p>
              <div className="account-atelier-address-actions">
                <Button
                  variant="outline"
                  disabled={!verified || busy}
                  onClick={() => setEditor(address)}
                >
                  Edit
                </Button>
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    disabled={!verified || busy}
                    onClick={() => {
                      void mutate(
                        `customers/me/addresses/${encodeURIComponent(address.id)}/default`,
                        "PATCH",
                      );
                    }}
                  >
                    Make default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  disabled={!verified || busy}
                  onClick={() => setRemoving(address)}
                >
                  Remove
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="account-atelier-empty">
          <MapPin size={29} strokeWidth={1.3} aria-hidden />
          <h3>A place for your next piece.</h3>
          <p>
            Your saved addresses will appear here. Add one when you’re ready.
          </p>
        </div>
      )}
      <Dialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open && !editorBusy) setEditor(null);
        }}
      >
        <DialogContent
          className="account-atelier-address-dialog"
          showCloseButton={!editorBusy}
          data-lenis-prevent
        >
          <DialogHeader>
            <DialogTitle>
              {editor === "new" ? "A new destination." : "Update your address."}
            </DialogTitle>
            <DialogDescription>
              Save your recipient and address details. Delivery availability and
              pricing are checked at checkout.
            </DialogDescription>
          </DialogHeader>
          {editor && (
            <AddressEditor
              key={typeof editor === "string" ? editor : editor.id}
              address={editor === "new" ? null : editor}
              onBusyChange={setEditorBusy}
              onSaved={() => {
                setEditorBusy(false);
                setEditor(null);
                resource.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setRemoving(null);
            setError("");
          }
        }}
      >
        <DialogContent className="account-atelier-address-dialog">
          <DialogHeader>
            <DialogTitle>Remove this address?</DialogTitle>
            <DialogDescription>
              {removing?.line1}. You can add it again later. Past orders keep
              their original delivery details.
            </DialogDescription>
          </DialogHeader>
          {error && <p role="alert">{error}</p>}
          <div className="account-atelier-dialog-actions">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                setRemoving(null);
                setError("");
              }}
            >
              Keep address
            </Button>
            <Button
              disabled={busy}
              onClick={() => {
                if (removing)
                  void mutate(
                    `customers/me/addresses/${encodeURIComponent(removing.id)}`,
                    "DELETE",
                  );
              }}
            >
              {busy ? "Removing…" : "Remove address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AddressEditor({
  address,
  onSaved,
  onBusyChange,
}: {
  address: SavedAddress | null;
  onSaved: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [state, setState] = useState(address?.state ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lifetime = useRef<AbortController | null>(null);
  useEffect(() => {
    lifetime.current = new AbortController();
    return () => lifetime.current?.abort();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !lifetime.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!state) {
      setError("Choose your state.");
      form.querySelector<HTMLButtonElement>('[role="combobox"]')?.focus();
      return;
    }
    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    const input: AddressInput = {
      recipientName: text("recipientName"),
      phone: text("phone"),
      line1: text("line1"),
      line2: text("line2") || null,
      city: text("city"),
      state,
      lga: text("lga") || null,
    };
    const controller = lifetime.current;
    setBusy(true);
    onBusyChange(true);
    setError("");
    try {
      await customerRequest(
        `customers/me/addresses${address ? `/${encodeURIComponent(address.id)}` : ""}`,
        {
          method: address ? "PATCH" : "POST",
          body: input,
          signal: controller.signal,
        },
      );
      if (!controller.signal.aborted) onSaved();
    } catch (cause) {
      if (!controller.signal.aborted) setError(friendly(cause));
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
        onBusyChange(false);
      }
    }
  }
  return (
    <form className="account-atelier-address-form" onSubmit={submit}>
      {error && (
        <p role="alert" className="account-atelier-feedback">
          {error}
        </p>
      )}
      <div className="account-atelier-form-grid">
        {(
          [
            ["recipientName", "Recipient name", "name", 120],
            ["phone", "Mobile phone", "tel", 32],
            ["line1", "Street address", "address-line1", 255],
            ["line2", "Address line 2 (optional)", "address-line2", 255],
            ["city", "City", "address-level2", 100],
            ["lga", "LGA (optional)", "off", 100],
          ] as const
        ).map(([name, label, autoComplete, maxLength]) => (
          <div className="account-atelier-form-field" key={name}>
            <Label htmlFor={`address-${name}`}>{label}</Label>
            <Input
              id={`address-${name}`}
              name={name}
              type={name === "phone" ? "tel" : "text"}
              autoComplete={autoComplete}
              maxLength={maxLength}
              required={name !== "line2" && name !== "lga"}
              defaultValue={address?.[name] ?? ""}
              disabled={busy}
            />
          </div>
        ))}
        <div className="account-atelier-form-field">
          <Label htmlFor="address-state">State</Label>
          <Select
            value={state}
            onValueChange={(value) => {
              if (value) setState(value);
            }}
            disabled={busy}
          >
            <SelectTrigger id="address-state" className="account-atelier-state">
              <SelectValue placeholder="Choose a state" />
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              align="start"
              className="store-select-popup"
            >
              {NIGERIAN_STATES.map((name) => (
                <SelectItem value={name} key={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="account-atelier-form-field">
          <Label htmlFor="address-country">Country</Label>
          <Input id="address-country" value="Nigeria" readOnly />
        </div>
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save address"}
        <ArrowRight size={16} aria-hidden />
      </Button>
    </form>
  );
}
