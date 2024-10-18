import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Cronify?",
    answer:
      "Cronify keeps your free-tier backends alive by automatically pinging them at regular intervals.",
  },
  {
    question: "How does Cronify work?",
    answer:
      "Sign up, add your backend URL, and configure the ping frequency. Cronify takes care of the rest.",
  },
  {
    question: "Is Cronify free?",
    answer: "Yes, Cronify offers a free tier for basic uptime monitoring.",
  },
  {
    question: "Will I get notified if my service goes down?",
    answer: "Yes, Cronify sends notifications if it detects downtime.",
  },
  {
    question: "Can I monitor multiple services?",
    answer:
      "Yes, you can monitor multiple services through the Cronify dashboard.",
  },
  {
    question: "Does Cronify affect my backend's performance?",
    answer:
      "No, Cronify performs lightweight pings that won't affect your backend's performance.",
  },
];
export default function Faq() {
  return (
    <div
      id="faqs"
      className="w-full h-[90vh] flex flex-col items-center justify-center py-10"
    >
      <div className="w-full text-center py-10">
        <p className="font-bold text-4xl">FAQs</p>
      </div>
      <Accordion type="single" collapsible className="md:w-4/6 w-5/6">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`${i}`}>
            <AccordionTrigger className="font-semibold md:text-xl text-lg text-start">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="md:text-lg text-base font-medium">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
