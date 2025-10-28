import ServiceCard from './ServiceCard';

type Service = {
  id: number;
  attributes: {
    name: string;
    slug: string;
    subtitle?: string;
    thumbnail?: {
      data?: { attributes?: { url?: string } };
      url?: string;
    };
  };
};

interface ServicesGridProps {
  services: Service[];
  showSubtitle?: boolean;
  linkable?: boolean;
  emptyMessage?: string;
}

export default function ServicesGrid({
  services,
  showSubtitle = false,
  linkable = false,
  emptyMessage = 'ไม่พบข้อมูลบริการในขณะนี้',
}: ServicesGridProps) {
  if (!services || services.length === 0) {
    return (
      <div className="w-full text-center py-16">
        <p className="font-['Kanit'] text-[18px] text-[#666666]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
      {services.map((service) => {
        if (!service || !service.attributes) return null;
        
        const { attributes } = service;
        const thumbnailUrl =
          attributes.thumbnail?.data?.attributes?.url ||
          attributes.thumbnail?.url ||
          '';

        return (
          <ServiceCard
            key={service.id}
            id={service.id}
            name={attributes.name}
            slug={attributes.slug}
            subtitle={attributes.subtitle}
            thumbnailUrl={thumbnailUrl}
            showSubtitle={showSubtitle}
            linkable={linkable}
          />
        );
      })}
    </div>
  );
}
