'use client';

import Image from 'next/image';

interface CaseStudySection {
  id?: number;
  title?: string;
  case_study_name?: string;
  industry_name?: string;
  cover_image?: {
    data?: { attributes?: { url?: string } } | { attributes?: { url?: string } }[];
  };
  case_study_detail?: string;
}

interface CaseStudySectionProps {
  sections: CaseStudySection[];
}

export default function CaseStudySection({ sections }: CaseStudySectionProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  const getImageUrl = (imageField: any): string | null => {
    if (!imageField?.data) return null;
    
    const imageData = Array.isArray(imageField.data) 
      ? imageField.data[0] 
      : imageField.data;
    
    if (!imageData?.attributes?.url) return null;
    
    const url = imageData.attributes.url;
    return url.startsWith('http') 
      ? url 
      : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${url}`;
  };

  return (
    <div className="flex flex-col gap-8 ">
      {sections.map((section, sectionIndex) => {
        const coverImageUrl = getImageUrl(section.cover_image);
        
        return (
          <div key={section.id || sectionIndex} className="flex flex-col gap-6">
            {section.title && (
              <h2 className="mt-16 font-['Kanit'] font-medium text-[1.375rem] lg:text-[1.75rem] text-primary underline decoration-accent decoration-2 underline-offset-8">
                {section.title}
              </h2>
            )}

            <div className="bg-[#ECEFF2] p-8 rounded-3xl flex flex-col gap-6">
              {coverImageUrl && (
                <div className="w-full aspect-square lg:aspect-auto lg:h-[25rem] relative rounded-3xl overflow-hidden">
                  <Image
                    src={coverImageUrl}
                    alt={section.case_study_name || 'Case study'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              <div className="flex flex-col gap-4">
                {section.case_study_name && (
                  <h3 className="font-['Kanit'] text-[1.375rem] font-bold text-primary">
                    {section.case_study_name}
                  </h3>
                )}
                
                {section.industry_name && (
                  <p className="text-end font-['Kanit'] text-base font-normal text-primary">
                    {section.industry_name}
                  </p>
                )}

                {section.case_study_detail && (
                  <div className="case-study-content">
                    <div dangerouslySetInnerHTML={{ __html: section.case_study_detail }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      <style jsx global>{`
        .case-study-content table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .case-study-content table tr {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }
        
        .case-study-content table td {
          padding: 0;
          display: block;
        }
        
        .case-study-content table td:first-child {
          font-family: 'Kanit', sans-serif;
          font-size: 1.375rem;
          font-weight: 500;
          color: var(--color-primary);
          margin-bottom: 0.25rem;
        }
        
        .case-study-content table td:last-child {
          font-family: 'Kanit', sans-serif;
          font-size: 1.375rem;
          font-weight: 400;
          color: var(--color-foreground);
          line-height: 1.75;
        }
        
        .case-study-content h4 {
          font-family: 'Kanit', sans-serif;
          font-size: 1.375rem;
          font-weight: 500;
          color: var(--color-primary);
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .case-study-content h3 {
          font-family: 'Kanit', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-primary);
          margin-top: 0.75rem;
          text-align: center;
        }
        
        @media (min-width: 1024px) {
          .case-study-content h3 {
            font-size: 1.375rem;
          }
        }
        
        .case-study-content p {
          font-family: 'Kanit', sans-serif;
          font-size: 1.375rem;
          font-weight: 400;
          color: var(--color-foreground);
          line-height: 1.75;
          margin-bottom: 0.5rem;
        }
        
        .case-study-content img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          border-radius: 1.5rem;
          margin: 1rem 0;
        }
        
        @media (min-width: 1024px) {
          .case-study-content img {
            aspect-ratio: auto;
            height: 25rem;
          }
        }
      `}</style>
    </div>
  );
}
