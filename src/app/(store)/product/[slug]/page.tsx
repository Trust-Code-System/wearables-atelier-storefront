import { ProductClient } from "./product-client";

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  return <ProductClient slug={slug} />;
}
