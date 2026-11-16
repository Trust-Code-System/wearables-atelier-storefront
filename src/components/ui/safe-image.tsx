"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * Product photos come from a signed media bucket that can fail or expire.
 * A broken-image icon with alt text spilling over the tile reads as a broken
 * shop, so fall back to a quiet branded tile instead.
 */
export function SafeImage({ alt, src, ...props }: ImageProps) {
  const [failedSrc, setFailedSrc] = useState<unknown>(null);
  if (failedSrc === src) {
    return alt ? <span className="product-image-placeholder" role="img" aria-label={alt}>Photo coming soon</span> : null;
  }
  return <Image {...props} src={src} alt={alt} onError={() => setFailedSrc(src)} />;
}
