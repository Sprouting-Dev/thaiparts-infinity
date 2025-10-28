'use client';

import { useState } from 'react';

interface FAQ {
  id?: number;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-['Kanit'] font-semibold text-[24px] md:text-[28px] text-[#1063A7] flex items-center gap-3">
        <div className="w-2 h-8 bg-[#E92928] rounded-full" />
        FAQs
      </h2>
      
      <div className="flex flex-col gap-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.id || index}
            className="bg-[#F5F5F5] rounded-lg overflow-hidden transition-all duration-300"
          >
            {/* Question Button */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-[#EBEBEB] transition-colors"
            >
              <span className="font-['Kanit'] font-medium text-[16px] md:text-[18px] text-[#1063A7] flex-1 pr-4">
                {faq.question}
              </span>
              
              {/* Chevron Icon */}
              <div
                className={`flex-shrink-0 transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              >
                <svg
                  className="w-6 h-6 text-[#1063A7]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {/* Answer Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-6 pt-2">
                <p className="font-['Kanit'] text-[15px] md:text-[16px] text-[#666666] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
