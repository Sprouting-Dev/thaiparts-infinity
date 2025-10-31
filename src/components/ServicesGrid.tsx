import ServiceCard from './ServiceCard';

type Service = {
  id: number;
  attributes: {
    title?: string;
    name?: string;
    slug: string;
    subtitle?: string;
    cover_image?: {
      data?:
        | { attributes?: { url?: string } }
        | { attributes?: { url?: string } }[];
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
        <p className="font-['Kanit'] text-sm lg:text-lg text-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const serviceOrder = [
    'system-design-and-engineering-service',
    'preventive-maintenance-and-calibration-service',
    'rapid-response-and-on-site-support',
  ];

  const sortedServices = [...services].sort((a, b) => {
    const indexA = serviceOrder.indexOf(a.attributes.slug);
    const indexB = serviceOrder.indexOf(b.attributes.slug);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
      {sortedServices.map(service => {
        if (!service || !service.attributes) return null;

        const { attributes } = service;

        const getCoverImageUrl = (): string => {
          if (!attributes.cover_image?.data) return '';

          const imageData = Array.isArray(attributes.cover_image.data)
            ? attributes.cover_image.data[0]
            : attributes.cover_image.data;

          if (!imageData?.attributes?.url) return '';

          const url = imageData.attributes.url;

          if (url.startsWith('/')) return url;
          if (url.startsWith('http')) return url;

          return `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${url}`;
        };

        const thumbnailUrl = getCoverImageUrl();
        const displayName = attributes.title || attributes.name || 'Service';

        return (
          <ServiceCard
            key={service.id}
            id={service.id}
            name={displayName}
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
