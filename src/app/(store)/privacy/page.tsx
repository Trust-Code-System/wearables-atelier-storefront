import type { Metadata } from "next";
import { CustomerInformationPage } from "@/components/layout/customer-information-page";
import { brandContact } from "@/lib/brand-contact";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Wearables Atelier handles information shared through the storefront.",
};

export default function PrivacyPage() {
  return (
    <CustomerInformationPage
      eyebrow="Your information"
      title="Privacy,"
      accent="plainly explained."
      introduction="This notice explains the information used to provide the storefront, fulfil orders and respond when you contact us."
      updated="12 October 2026"
    >
      <section className="information-section">
        <span>01</span>
        <div>
          <h2>Information you share</h2>
          <p>
            We may receive your name, email address, phone number, delivery address, order
            details and any information you choose to share when you place an order, create
            an account or contact the atelier.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>02</span>
        <div>
          <h2>How it is used</h2>
          <p>
            We use this information to process and deliver orders, provide customer care,
            manage exchanges, keep necessary business records and send marketing messages
            only where you have chosen to receive them.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>03</span>
        <div>
          <h2>Storefront preferences</h2>
          <p>
            This site may use browser storage to remember your bag, wishlist, preferred
            currency and other storefront choices on your device. You can clear this data
            using your browser settings, although doing so may reset those choices.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>04</span>
        <div>
          <h2>Payments and service providers</h2>
          <p>
            When online payments are enabled, payment details are handled by the payment
            provider identified at checkout; we do not need to store your complete card
            details. We may also share only the information needed with delivery, hosting
            and other service providers that help us operate the store.
          </p>
        </div>
      </section>
      <section className="information-section">
        <span>05</span>
        <div>
          <h2>Your choices</h2>
          <p>
            You may ask what personal information we hold about you, request a correction
            or ask us to delete information we no longer need to keep. You can also withdraw
            from marketing messages at any time.
          </p>
          <p>
            Send privacy questions to{" "}
            <a href={`mailto:${brandContact.email}`}>{brandContact.email}</a>.
          </p>
        </div>
      </section>
    </CustomerInformationPage>
  );
}
