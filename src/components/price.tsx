"use client";

import { useCurrency } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  amountNGN,
  compareAtNGN,
  className,
}: {
  amountNGN: number;
  compareAtNGN?: number;
  className?: string;
}) {
  const { currency } = useCurrency();
  return (
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}>
      <span>{formatPrice(amountNGN, currency)}</span>
      {compareAtNGN ? (
        <span className="text-[0.8125em] text-muted-foreground line-through">
          {formatPrice(compareAtNGN, currency)}
        </span>
      ) : null}
    </span>
  );
}
