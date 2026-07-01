import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Star, ShoppingCart, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart, t } = useStore();

  const isDiscounted = product.discountPrice && product.discountPrice < product.originalPrice;
  const currentPrice = isDiscounted ? product.discountPrice! : product.originalPrice;
  const discountPercent = isDiscounted 
    ? Math.round(((product.originalPrice - product.discountPrice!) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-white">
        {product.newArrival && (
          <span className="flex items-center gap-1 rounded-md bg-[#1A1A1A] px-2.5 py-1 shadow">
            <Sparkles className="h-3 w-3 text-[#C5A059]" />
            New
          </span>
        )}
        {isDiscounted && (
          <span className="rounded-md bg-amber-500 px-2.5 py-1 shadow">
            -{discountPercent}% OFF
          </span>
        )}
        {product.stock === 0 && (
          <span className="rounded-md bg-stone-500 px-2.5 py-1 shadow">
            {t('outOfStock')}
          </span>
        )}
      </div>

      {/* Image Gallery Trigger */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative aspect-square w-full cursor-pointer overflow-hidden bg-stone-50"
      >
        {product.images[0] && (product.images[0].startsWith('data:video/') || product.images[0].endsWith('.mp4') || product.images[0].endsWith('.mov') || product.images[0].endsWith('.webm')) ? (
          <video
            src={product.images[0]}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <img 
            src={product.images[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80'} 
            alt={product.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Fallback placeholder image if URL fails
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80';
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between font-sans">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">
            {product.category}
          </span>
          {product.averageRating && (
            <div className="flex items-center space-x-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-stone-600">{product.averageRating}</span>
            </div>
          )}
        </div>

        {/* Name */}
        <h3 
          onClick={() => onViewDetails(product)}
          className="font-serif text-base font-semibold text-stone-800 line-clamp-1 cursor-pointer hover:text-[#C5A059] transition-colors mb-2.5"
        >
          {product.name}
        </h3>

        {/* Price & Cart Trigger */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-col">
            {isDiscounted && (
              <span className="font-sans text-xs text-stone-400 line-through">
                ৳{product.originalPrice}
              </span>
            )}
            <span className="font-serif text-lg font-bold text-[#1A1A1A]">
              ৳{currentPrice}
            </span>
          </div>

          <button 
            onClick={() => product.stock > 0 && addToCart(product, 1)}
            disabled={product.stock === 0}
            className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-sm transition-all ${
              product.stock > 0 
                ? 'bg-[#1A1A1A] text-white hover:bg-[#C5A059] active:scale-95' 
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
            title={product.stock > 0 ? t('addToCart') : t('outOfStock')}
          >
            <ShoppingCart className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
