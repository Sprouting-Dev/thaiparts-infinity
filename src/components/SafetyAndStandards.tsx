type RichTextChild = {
  text?: string;
  bold?: boolean;
  italic?: boolean;
};

type RichTextBlock = {
  type: string;
  children?: RichTextChild[];
};

interface SafetySection {
  id?: number;
  title: string;
  description?: unknown;
  cards?: unknown;
}

interface SafetyAndStandardsProps {
  sections: SafetySection[];
  parseListItems: (data: unknown) => string[];
  renderRichText: (data: unknown) => string;
}

export default function SafetyAndStandards({
  sections,
  renderRichText,
}: SafetyAndStandardsProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  const parseCards = (
    data: unknown
  ): { title: string; description: string }[] => {
    if (!Array.isArray(data)) return [];

    const cards: { title: string; description: string }[] = [];
    let currentTitle = '';

    data.forEach((block: RichTextBlock) => {
      if (block.type === 'heading') {
        const title = block.children
          ?.map((child: RichTextChild) => child.text || '')
          .join('')
          .trim();

        if (title) {
          currentTitle = title;
        }
      } else if (block.type === 'paragraph' && currentTitle) {
        const description = block.children
          ?.map((child: RichTextChild) => child.text || '')
          .join('')
          .trim();

        if (description) {
          cards.push({ title: currentTitle, description });
          currentTitle = '';
        }
      }
    });

    return cards;
  };

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section, index) => {
        const descriptionHtml = section.description
          ? renderRichText(section.description)
          : null;
        const cardsList = section.cards ? parseCards(section.cards) : [];

        return (
          <div key={section.id || index} className="flex flex-col gap-6">
            {section.title && (
              <h2 className="mt-16 font-['Kanit'] font-medium text-[1.375rem] lg:text-[1.75rem] text-primary underline decoration-accent decoration-2 underline-offset-8">
                {section.title}
              </h2>
            )}

            {descriptionHtml && (
              <div className="py-4">
                <div
                  className="font-['Kanit'] text-[1.375rem] font-normal  text-foreground"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </div>
            )}

            {cardsList.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {cardsList.map((card, idx: number) => (
                  <div
                    key={idx}
                    className="bg-[#ECEFF2] rounded-2xl p-6 md:p-8 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer "
                  >
                    <h3 className="font-['Kanit'] font-bold text-[1.375rem] lg:text-[1.75rem] text-primary text-center">
                      {card.title}
                    </h3>
                    <p className="font-['Kanit'] font-medium text-base lg:text-[1.375rem]  text-primary text-center">
                      {card.description}
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
