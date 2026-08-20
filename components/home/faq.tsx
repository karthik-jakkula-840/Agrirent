import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is Agriform?",
    answer: "Agriform is India's leading smart agricultural equipment rental marketplace. We connect farmers who need machinery with verified equipment owners, ensuring affordable, safe, and efficient rentals."
  },
  {
    question: "How do I rent equipment?",
    answer: "Renting is easy! Simply search for the equipment you need, select your desired dates, and send a booking request. Once the verified owner approves, you can proceed with the secure payment."
  },
  {
    question: "How do I become a rental owner?",
    answer: "Click on 'Become a Rental Owner' to sign up. You will need to provide your details and register your equipment. Once our team verifies your profile, your equipment will be listed for farmers to rent."
  },
  {
    question: "How are equipment owners verified?",
    answer: "We perform a thorough background check, verify identity documents, and ensure that the listed equipment meets our quality and safety standards before an owner can accept bookings."
  },
  {
    question: "How is payment handled?",
    answer: "All payments are securely processed through our platform. We hold the funds in escrow until the rental period begins, ensuring peace of mind for both farmers and owners."
  },
  {
    question: "Can I cancel a booking?",
    answer: "Yes, bookings can be cancelled subject to our cancellation policy. Cancellations made well in advance typically receive a full refund."
  },
  {
    question: "Is equipment insured?",
    answer: "We strongly recommend that owners maintain active insurance for their machinery. Agriform also provides basic damage protection for eligible rentals during the booking period."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach our 24/7 support team through the Contact Form below, or call our dedicated helpline listed on the contact page."
  }
]

export function Faq() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about renting and listing equipment on Agriform.
          </p>
        </div>

        {/* @ts-ignore */}
        <Accordion type="single" className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-100 py-2">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-base leading-relaxed pt-2 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
