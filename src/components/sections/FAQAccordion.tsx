'use client';

import { useState } from 'react';

interface AccordionItem {
  id?: number;
  question: string;
  answer: string;
}

interface FAQSection {
  id?: number;
  title?: string;
  acordian?: AccordionItem[];
}

interface FAQAccordionProps {
  sections: FAQSection[];
}

export default function FAQAccordion({ sections }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFAQ = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section, sectionIndex) => {
        const accordions = section.acordian || [];
        const sectionId = section.id || `section-${sectionIndex}`;

        return (
          <div key={sectionId} className="flex flex-col gap-6">
            {section.title && (
              <h2 className="mt-16 font-['Kanit'] font-medium text-[1.375rem] lg:text-[1.75rem] text-primary underline decoration-accent decoration-2 underline-offset-8">
                {section.title}
              </h2>
            )}

            {accordions.length > 0 && (
              <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map(col => {
                  const colItems = accordions.filter(
                    (_, idx) => idx % 2 === col
                  );
                  return (
                    <div
                      key={`col-${sectionId}-${col}`}
                      className=" flex flex-col gap-4"
                    >
                      {colItems.map((item, i) => {
                        const originalIndex = col + i * 2;
                        const uniqueKey = `faq-${sectionId}-${item.id ?? `idx${originalIndex}`}`;
                        const isOpen = openIndex === uniqueKey;

                        return (
                          <div
                            key={uniqueKey}
                            className="bg-[#ECEFF2] rounded-2xl overflow-hidden transition-all duration-300 border border-white"
                          >
                            <button
                              onClick={() => toggleFAQ(uniqueKey)}
                              className="w-full flex items-center justify-between px-8 py-4 text-left cursor-pointer"
                            >
                              <span className="font-prompt text-base lg:text-[1.375rem] text-primary font-normal flex-1 pr-4">
                                {item.question}
                              </span>

                              <div
                                className={`flex-shrink-0 transition-transform duration-300 ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              >
                                <svg
                                  className="w-6 h-6 text-primary"
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

                            {isOpen && (
                              <div className="overflow-hidden transition-all duration-300 max-h-[500px] opacity-100 px-8">
                                <div className="py-4 border-t border-[#1063a7]/50">
                                  <p className="font-prompt text-base lg:text-[1.375rem] text-primary font-normal leading-relaxed">
                                    {item.answer}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
