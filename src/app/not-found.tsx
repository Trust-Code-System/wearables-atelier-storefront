import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Wearables Atelier</p>
      <h1 className="font-display text-4xl">We couldn’t find that page</h1>
      <p className="text-muted-foreground">The link may be old or mistyped. You can go to the home page or look at all our products.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground" href="/shop">Shop all products</Link>
        <Link className="inline-flex min-h-11 items-center rounded-md border px-5 text-sm font-medium" href="/">Go to the home page</Link>
      </div>
    </div>
  );
}
