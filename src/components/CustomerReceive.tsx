interface CustomerReceiveSection {
  id?: number;
  title?: string;
  cards?: any;
}

interface CustomerReceiveProps {
  sections: CustomerReceiveSection[];
  parseListItems: (data: any) => string[];
}

export default function CustomerReceive({ 
  sections, 
  parseListItems 
}: CustomerReceiveProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section, index) => {
        const cards = parseListItems(section.cards);
        
        return (
          <div key={section.id || index} className="flex flex-col gap-6">
            {section.title && (
              <h2 className="mt-16 font-['Kanit'] font-medium text-[1.75rem] text-primary underline decoration-accent decoration-2 underline-offset-8">
                {section.title}
              </h2>
            )}

            {cards && cards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {cards.map((card, idx) => (
                  <div 
                    key={idx}
                    className="bg-[#ECEFF2] rounded-2xl p-6 md:p-8 flex items-center justify-center hover:shadow-lg transition-shadow duration-300 cursor-pointer min-h-[120px]"
                  >
                    <p className="font-['Kanit'] font-medium text-[1.375rem] text-primary text-center leading-relaxed">
                      {card}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
