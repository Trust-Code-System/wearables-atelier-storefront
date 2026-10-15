import { ProductClient } from "./product-client";
import { loadProduct } from "@/lib/catalog-api";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();
  return <ProductClient key={slug} slug={slug} />;
}
