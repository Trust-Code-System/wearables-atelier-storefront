import type { Metadata } from "next";
import HomePage from "./home-client";
import { SITE_DESCRIPTION, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata("Nigerian Occasionwear & Jewellery", SITE_DESCRIPTION, "/"),
  title: { absolute: "Wearables by Ashabi | Nigerian Occasionwear & Jewellery" },
};

export default function Page() {
  return <HomePage />;
}
