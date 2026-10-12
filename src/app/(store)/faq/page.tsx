import type { Metadata } from "next";
import { CustomerInformationPage } from "@/components/layout/customer-information-page";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers about Wearables Atelier orders, sizing, delivery, exchanges and visits.",
};

const questions = [
  {
    question: "How do I place an order?",
    answer:
      "Choose your piece, select a size where needed, and add it to your bag. Checkout will guide you through your contact details, delivery method and payment. You can also speak with the atelier on WhatsApp if you would like help before ordering.",
  },
  {
    question: "How do I choose the right size?",
    answer:
      "Clothing is listed in numbered sizes on each product page. If you are between sizes or buying for a particular occasion, message the atelier with the piece you love and we will help you choose.",
  },
  {
    question: "Where do you deliver?",
    answer:
      "We deliver within Lagos and across Nigeria. Standard nationwide delivery usually takes 2–4 business days after dispatch. Same-day delivery may be available within Lagos for orders confirmed early enough.",
  },
  {
    question: "Is delivery complimentary?",
    answer:
      "Standard delivery is complimentary when your order reaches the threshold shown in the announcement bar and at checkout. For smaller orders, the available delivery fee is shown before payment.",
  },
  {
    question: "Can I exchange or return an item?",
    answer:
      "Eligible clothing can be exchanged for another size within 7 days of delivery when unworn, unwashed and returned with its original tags. Earrings are final sale for hygiene reasons unless they arrive faulty.",
  },
  {
    question: "Can I collect my order from the atelier?",
    answer:
      "Collection may be arranged from our Surulere, Lagos atelier. Please contact us before visiting so we can confirm that your order is ready and agree a collection time.",
  },
  {
    question: "Do you offer custom pieces or styling help?",
    answer:
      "Availability depends on the piece and your timeline. Send us the occasion, date and what you have in mind on WhatsApp, and the atelier will let you know what is possible.",
  },
  {
    question: "How should I care for my piece?",
    answer:
      "Care instructions vary by material and finish. Check the details on the product page and keep jewelry dry, stored separately and away from perfume. Contact us before cleaning an embellished garment if you are unsure.",
  },
];

export default function FaqPage() {
  return (
    <CustomerInformationPage
      eyebrow="Questions, answered"
      title="A little clarity."
      accent="A lot more confidence."
      introduction="Everything you may want to know before choosing, ordering or wearing your next piece."
    >
      <div className="faq-list">
        {questions.map((item, index) => (
          <details key={item.question} name="frequently-asked-questions" open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.question}
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </CustomerInformationPage>
  );
}
