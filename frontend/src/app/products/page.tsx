import { Metadata } from 'next';
import { BsCaretDownFill } from "react-icons/bs";
import { Product } from '@/types/product';
import { mockProducts } from '@/services/productService';

// Component สำหรับแสดงแต่ละ Product
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="w-full h-auto bg-secondary hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      {/* Product Image */}
      <div className="relative aspect-video bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        {/* Tag */}
        <div className="mb-2">
          <span className="text-[#007AA3] text-sm font-semibold bg-[#D7F5FF] px-3 py-1 rounded-full">
            {product.tag}
          </span>
        </div>
        
        {/* Product Name */}
        <h3 className="text-foreground text-2xl font-medium mb-2">
          {product.name}
        </h3>
        
        {/* Description (optional) */}
        {product.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {product.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default function ProductsPage() {
  return (
    <>
      <div className='mt-40 px-4 w-full flex justify-between items-center'>
        <h1 className='text-primary font-medium text-2xl flex items-center gap-4'>
          <span className='w-3 h-3 bg-[var(--color-accent)] rounded-full'></span>
          Product
        </h1>
        
        <div className='rounded-full p-1 cursor-pointer' style={{background: 'linear-gradient(to bottom, #C8E5FD, #4085BD)'}}>
          <div className='bg-primary rounded-full px-5 py-2'>
            <div className='flex items-center gap-3 text-secondary text-lg'>
              <span className='w-3 h-3 bg-[var(--color-accent)] rounded-full'></span>
              <span>All</span>
              <BsCaretDownFill />
            </div>
          </div>
        </div>
      </div>

      <h1 className='text-primary text-2xl font-medium w-full px-4 mt-14 underline decoration-[var(--color-accent)] underline-offset-8'>
        อะไหล่เครื่องจักร (Spare Parts)
      </h1>

      {/* Products Grid */}
      <div className="px-4 mt-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Loading state example (เตรียมไว้สำหรับต่อ database) */}
      {/* 
      {isLoading ? (
        <div className="px-4 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
      */}
    </>
  );
}