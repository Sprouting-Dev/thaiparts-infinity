import Image from 'next/image';
import Link from 'next/link';

interface ServiceCardProps {
  id: number;
  name: string;
  slug: string;
  subtitle?: string;
  thumbnailUrl?: string;
  showSubtitle?: boolean;
  linkable?: boolean;
}

export default function ServiceCard({
  id,
  name,
  slug,
  subtitle,
  thumbnailUrl,
  showSubtitle = false,
  linkable = false,
}: ServiceCardProps) {
  const CardContent = () => (
    <div className="group flex flex-col gap-3 hover:transform hover:scale-[1.02] transition-all duration-200">
      <div className="w-full aspect-[300/220] overflow-hidden rounded-lg relative">
        {thumbnailUrl ? (
          (() => {
            const isExternal = thumbnailUrl.startsWith('http');
            const src = isExternal
              ? thumbnailUrl
              : thumbnailUrl.startsWith('/')
              ? thumbnailUrl
              : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${thumbnailUrl}`;
            return (
              <Image
                src={src}
                alt={name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized={isExternal}
              />
            );
          })()
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
            <div className="text-neutral-400 text-4xl">🔧</div>
          </div>
        )}
      </div>

      <h3 className="font-['Kanit'] font-medium text-[20px] leading-tight text-[#333333] group-hover:text-[#1063A7] transition-colors duration-200">
        {name}
      </h3>

      {showSubtitle && subtitle && (
        <p className="font-['Kanit'] text-[16px] text-[#666666] -mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (linkable) {
    return (
      <Link href={`/services/${slug}`} key={id}>
        <CardContent />
      </Link>
    );
  }

  return <div key={id}><CardContent /></div>;
}
