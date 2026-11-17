import React, { useState } from 'react';
import { Croissant } from 'lucide-react';

interface ProductImageProps {
  src: string | null;
  alt: string;
  category?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category,
  className = '',
  imgClassName = '',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F5EFE6] text-[#5C534C] p-4 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-11 h-11 rounded-full bg-white/80 flex items-center justify-center mb-2 text-[#E31E24] border border-[#E6DEC8]">
          <Croissant className="w-5 h-5" aria-hidden="true" />
        </div>
        <span className="text-xs font-semibold text-[#212529] line-clamp-1">{alt}</span>
        {category && (
          <span className="text-[11px] text-[#868E96] mt-0.5">Visuel officiel à compléter</span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F5EFE6] flex items-center justify-center ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setHasError(true)}
        className={`w-full h-full object-contain transition-transform duration-200 ${imgClassName}`}
      />
    </div>
  );
};
