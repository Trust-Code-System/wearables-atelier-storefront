import type { Metadata } from "next";
import { CustomerInformationPage } from "@/components/layout/customer-information-page";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: "Wearables Atelier delivery, collection, exchange and returns information.",
};

export default function ShippingReturnsPage() {
  return (
    <CustomerInformationPage
      eyebrow="From our atelier to you"
      title="Delivery with care."
      accent="Easy exchanges."
      introduction="The practical details for receiving your order—and what to do when something is not quite right."
      updated="12 October 2026"
    >
      <section className="information-section">
        <span>01</span>
        <div>
          <h2>Preparing your order</h2>
          <p>
            In-stock pieces are normally prepared and dispatched within 48 hours of order
            confirmation. We will contact you if an item needs more time or if we need to
            confirm any part of your order.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>02</span>
        <div>
          <h2>Delivery</h2>
          <p>
            Standard delivery across Nigeria usually takes 2–4 business days after
            dispatch. Same-day delivery may be available within Lagos for eligible orders
            confirmed before the daily cut-off. Timing can vary by destination and courier.
          </p>
          <p>
            Standard delivery is complimentary above the order threshold displayed on the
            site. All other available delivery fees are shown at checkout before payment.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>03</span>
        <div>
          <h2>Atelier collection</h2>
          <p>
            Collection from our Surulere atelier may be arranged in advance. Please wait
            for confirmation that your order is ready before making your journey.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>04</span>
        <div>
          <h2>Exchanges</h2>
          <p>
            Contact us within 7 days of delivery to request an eligible size exchange.
            Items must be unworn, unwashed, unaltered and returned with all original tags
            and packaging. An exchange is subject to the requested replacement being in stock.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>05</span>
        <div>
          <h2>Returns and exceptions</h2>
          <p>
            Earrings are final sale for hygiene reasons unless faulty. Bespoke, altered and
            personalised pieces cannot be returned or exchanged. Delivery charges are not
            refundable unless the item supplied was faulty or incorrect.
          </p>
          <p>
            If your order arrives damaged or does not match what you ordered, contact us
            promptly with your order reference and clear photographs so we can put it right.
          </p>
        </div>
      </section>
    </CustomerInformationPage>
  );
}
