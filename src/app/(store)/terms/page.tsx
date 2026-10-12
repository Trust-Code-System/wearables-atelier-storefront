import type { Metadata } from "next";
import { CustomerInformationPage } from "@/components/layout/customer-information-page";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: "The terms that apply when using the Wearables Atelier storefront or placing an order.",
};

export default function TermsPage() {
  return (
    <CustomerInformationPage
      eyebrow="The fine print"
      title="Clear terms."
      accent="Beautiful pieces."
      introduction="These terms apply when you use this storefront or place an order with Wearables Atelier."
      updated="12 October 2026"
    >
      <section className="information-section">
        <span>01</span>
        <div>
          <h2>Using the storefront</h2>
          <p>
            Please use the site lawfully and provide accurate information when ordering.
            Product descriptions, imagery and availability may be updated without notice.
            Colours can also vary slightly between screens and in different light.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>02</span>
        <div>
          <h2>Orders</h2>
          <p>
            An order is a request to purchase. It is accepted when we confirm it and, where
            required, receive successful payment. If a piece becomes unavailable or an
            obvious pricing error is found, we may cancel the affected item and arrange a
            refund of any amount paid for it.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>03</span>
        <div>
          <h2>Prices and payment</h2>
          <p>
            Prices are shown in the selected display currency. The checkout total includes
            the products and any applicable delivery charge shown before you confirm the
            order. Your payment provider may apply its own currency conversion or bank fees.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>04</span>
        <div>
          <h2>Delivery, exchanges and returns</h2>
          <p>
            Delivery estimates are not guaranteed and can be affected by couriers,
            destination or events outside our reasonable control. Eligibility for exchanges
            and returns is set out on our Shipping &amp; Returns page and forms part of these terms.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>05</span>
        <div>
          <h2>Our work</h2>
          <p>
            The Wearables Atelier name, branding, site design, copy and imagery may not be
            copied or used commercially without permission. Product names and third-party
            material remain the property of their respective owners.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>06</span>
        <div>
          <h2>Responsibility and contact</h2>
          <p>
            Nothing in these terms removes rights that cannot lawfully be excluded. To the
            extent permitted by law, we are not responsible for indirect loss arising from
            use of the site. These terms are governed by the laws of the Federal Republic
            of Nigeria.
          </p>
          <p>Contact the atelier if you have a question before placing an order.</p>
        </div>
      </section>
    </CustomerInformationPage>
  );
}
