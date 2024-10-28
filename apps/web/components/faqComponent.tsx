import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
  import { faqs } from "@/lib/constants/faq.constants";
  import { useInView } from "react-intersection-observer";
  import { motion } from "framer-motion";
  export default function Faq() {
    const { ref: ref1, inView: inView1 } = useInView({
      threshold: 0.6,
      triggerOnce: false,
    });
  
    const { ref: ref2, inView: inView2 } = useInView({
      threshold: 0.6,
      triggerOnce: false,
    });
  
    return (
      <div
        id="faqs"
        className="w-full h-[90vh] flex flex-col items-center justify-center py-10"
      >
        <div className="w-full text-center py-10">
          <motion.p
            ref={ref1}
            initial={{ opacity: 0, y: 20 }}
            animate={inView1 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeIn" }}
            className="font-bold text-4xl"
          >
            FAQs
          </motion.p>
        </div>
        <motion.div
          className="w-full flex justify-center items-center"
          ref={ref2}
          initial={{ opacity: 0, y: 20 }}
          animate={inView2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: "easeIn" }}
        >
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
        </motion.div>
      </div>
    );
  }
  