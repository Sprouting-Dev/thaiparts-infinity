interface TechnologySection {
  id?: number;
  title?: string;
  detail?: unknown;
}

interface TechnologySectionProps {
  sections: TechnologySection[];
  parseListItems: (data: unknown) => string[];
}

export default function TechnologySection({
  sections,
  parseListItems,
}: TechnologySectionProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section, sectionIndex) => {
        const items = section.detail ? parseListItems(section.detail) : [];

        return (
          <div key={section.id || sectionIndex} className="flex flex-col gap-6">
            {section.title && (
              <h2 className="mt-16 font-['Kanit'] font-medium text-[1.375rem] lg:text-[1.75rem] text-primary underline decoration-accent decoration-2 underline-offset-8">
                {section.title}
              </h2>
            )}

            {items.length > 0 && (
              <ul className="space-y-2 pl-2 ml-6 list-disc list-outside">
                {items.map((item: string, itemIdx: number) => (
                  <li
                    key={itemIdx}
                    className="font-['Kanit'] text-base lg:text-[1.375rem] font-normal text-foreground pl-2 marker:text-primary"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
