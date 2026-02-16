'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FAQPageJsonLd } from "@/components/seo/JsonLd";

const faqs = [
    {
        question: "How is my data secured?",
        answer: "Your medical records are encrypted using military-grade encryption before being stored on IPFS. The hash of the record is then stored on the Polygon blockchain. Only your private key can decrypt the data."
    },
    {
        question: "Can doctors see my data without permission?",
        answer: "No. You must explicitly grant access to a doctor or hospital using their wallet address. You can revoke this access at any time."
    },
    {
        question: "What happens if I lose my private key?",
        answer: "Since HealthChain is non-custodial, we cannot recover your private key. We strongly recommend using a secure wallet implementation or a social recovery wallet."
    },
    {
        question: "Is HealthChain HIPAA compliant?",
        answer: "HealthChain is designed with privacy-first principles that align with GDPR and HIPAA requirements, specifically focusing on patient ownership and consent."
    },
    {
        question: "What does it cost to use?",
        answer: "Basic patient accounts are free. Transactions on the Polygon network cost fractions of a cent, often subsidized by our platform for standard users."
    }
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
            <FAQPageJsonLd faqs={faqs} />
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-6">
                        <HelpCircle className="w-6 h-6 text-blue-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
                    <p className="text-gray-400 text-lg">Everything you need to know about HealthChain.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8"
                >
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                                <AccordionTrigger className="text-left text-lg hover:text-blue-400 hover:no-underline transition-colors py-6">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-400 leading-relaxed pb-6 text-base">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </div>
    );
}
