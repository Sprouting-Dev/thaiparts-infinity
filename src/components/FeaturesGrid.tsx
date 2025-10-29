import Image from 'next/image';

interface FeatureItem {
  id?: number;
  icon?: {
    data?: { attributes?: { url?: string } } | { attributes?: { url?: string } }[];
    url?: string;
  };
  text: string;
}

interface FeaturesSection {
  id?: number;
  title?: string;
  features_item?: FeatureItem[];
}

interface FeaturesGridProps {
  sections: FeaturesSection[];
}

export default function FeaturesGrid({ sections }: FeaturesGridProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section, sectionIndex) => {
        const features = section.features_item || [];
        
        return (
          <div key={section.id || sectionIndex} className="flex flex-col gap-6">
            {section.title && (
              <h2 className="mt-16 font-['Kanit'] font-medium text-[1.375rem] lg:text-[1.75rem] text-primary underline decoration-accent decoration-2 underline-offset-8">
                {section.title}
              </h2>
            )}

            {features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {features.map((feature, index) => {
                  let iconUrl = null;
                  
                  if (feature.icon?.data) {
                    const iconData = Array.isArray(feature.icon.data) 
                      ? feature.icon.data[0] 
                      : feature.icon.data;
                    
                    if (iconData?.attributes?.url) {
                      const url = iconData.attributes.url;
                      iconUrl = url.startsWith('http') 
                        ? url 
                        : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${url}`;
                    }
                  }

                  return (
                    <div
                      key={feature.id || index}
                      className="bg-[#ECEFF2] rounded-2xl p-6 md:p-8 flex flex-col items-center gap-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer min-h-[180px] justify-center"
                    >
                      {iconUrl && (
                        <div className="w-16 h-16 md:w-20 md:h-20 relative flex-shrink-0">
                          <Image
                            src={iconUrl}
                            alt={feature.text}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                      
                      <h3 className="font-['Kanit'] font-medium text-[1.125rem] md:text-[1.25rem] text-primary text-center">
                        {feature.text}
                      </h3>
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
