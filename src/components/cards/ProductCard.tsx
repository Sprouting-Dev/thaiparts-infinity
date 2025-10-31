import Image from 'next/image';
import { Product } from '@/types/product';
import { getColorByTagName, getCategoryBadgeStyle } from '@/lib/categoryBadge';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  className?: string;
  showPrice?: boolean;
  showStock?: boolean;
}

export const ProductCard = ({
  product,
  onClick,
  className = '',
}: ProductCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    } else if (product.slug) {
      router.push(`/products/${product.slug}`);
    }
  };

  const tagColor = getColorByTagName(product.tag);
  const badgeStyle = getCategoryBadgeStyle(tagColor);

  return (
    <div
      className={`w-full h-auto bg-secondary transition-shadow duration-300 cursor-pointer overflow-hidden hover:transform hover:scale-[1.02] ${className}`}
      onClick={handleClick}
    >
      <div className="relative w-full aspect-[300/220] bg-gray-100 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center rounded-lg">
            {/* Neutral placeholder when CMS image is missing; does not point to a local asset */}
          </div>
        )}
      </div>

      <div className="py-4">
        <div className="mb-2">
          <span
            className={`text-[14px] leading-[21px] font-semibold px-2 py-1 rounded-full ${badgeStyle?.bg || 'bg-gray-100'} ${badgeStyle?.text || 'text-gray'}`}
          >
            {product.tag}
          </span>
        </div>

        <h3 className="text-foreground text-base lg:text-[1.375rem] font-medium mb-2 ">
          {product.name}
        </h3>
      </div>
    </div>
  );
};
