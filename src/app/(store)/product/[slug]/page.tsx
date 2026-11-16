import { ProductClient } from "./product-client";
import { loadProduct } from "@/lib/catalog-api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata, productSchema } from "@/lib/seo";

const getProduct = cache(loadProduct);

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const metadata = pageMetadata(product.name, product.description.slice(0, 160), `/product/${encodeURIComponent(product.slug)}`);
  if (product.images.length) {
    metadata.openGraph = { ...metadata.openGraph, images: product.images.map((url) => ({ url, alt: product.name })) };
    metadata.twitter = { ...metadata.twitter, images: product.images };
  }
  return metadata;
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return <><JsonLd data={productSchema(product)} /><ProductClient key={slug} slug={slug} initialProduct={product} /></>;
}
