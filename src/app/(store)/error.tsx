"use client";
export default function StoreError({ reset }: { reset: () => void }) {
  return <div className="mx-auto max-w-lg px-6 py-24 text-center">
    <h1 className="font-display text-2xl">The collection is temporarily unavailable</h1>
    <p className="my-4">Please try again in a moment.</p>
    <button className="store-button" onClick={reset}>Try again</button>
  </div>;
}
