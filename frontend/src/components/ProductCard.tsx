import { Product } from '@/types/product';
import { getColorByTagName, getCategoryBadgeStyle } from '@/lib/categoryBadge';

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
  className = "",
}: ProductCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  const tagColor = getColorByTagName(product.tag);
  const badgeStyle = getCategoryBadgeStyle(tagColor);

  return (
    <div 
      className={`w-full h-auto bg-secondary transition-shadow duration-300 cursor-pointer overflow-hidden ${className}`}
      onClick={handleClick}
    >
      <div className="relative aspect-video bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Image failed to load:', product.image);
            e.currentTarget.src = '/placeholder-image.jpg';
          }}
        />
      </div>

      <div className='py-4'>
        <div className="mb-2">
          <span className={`text-xs lg:text-[0.82rem] font-semibold px-3 py-1 rounded-full ${badgeStyle?.bg || 'bg-gray-100'} ${badgeStyle?.text || 'text-gray-600'}`}>
            {product.tag}
          </span>
        </div>

        <h3 className="text-foreground text-base lg:text-[1.375rem] font-medium mb-2 line-clamp-2">
          {product.name}
        </h3>
      </div>
    </div>
  );
};