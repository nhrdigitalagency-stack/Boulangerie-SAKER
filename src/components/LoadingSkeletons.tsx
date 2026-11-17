import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="bg-white rounded-[14px] border border-[#E6DEC8] overflow-hidden flex flex-col justify-between shadow-[0_2px_12px_rgba(42,24,16,0.03)]"
    >
      <div>
        <div className="aspect-[4/3] w-full bg-[#F5EFE6] border-b border-[#EFE9DC] p-3 flex items-center justify-center">
          <div className="w-full h-full rounded-[10px] saker-shimmer" />
        </div>

        <div className="p-3 sm:p-4 space-y-2.5">
          <div className="h-3 w-20 rounded-full saker-shimmer" />
          <div className="h-4 w-4/5 rounded-md saker-shimmer" />
          <div className="space-y-1.5 pt-0.5">
            <div className="h-3 w-full rounded saker-shimmer" />
            <div className="h-3 w-2/3 rounded saker-shimmer" />
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2.5 border-t border-[#EFE9DC] flex items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="h-4 w-20 rounded-md saker-shimmer" />
          <div className="h-2.5 w-12 rounded saker-shimmer" />
        </div>
        <div className="h-8 sm:h-9 w-20 rounded-[10px] saker-shimmer" />
      </div>
    </div>
  );
};

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="bg-white rounded-[14px] p-3 sm:p-3.5 border border-[#E6DEC8] flex flex-col justify-between gap-2.5 shadow-[0_2px_10px_rgba(42,24,16,0.03)]"
    >
      <div className="w-full aspect-[4/3] rounded-[10px] saker-shimmer" />
      <div className="flex items-end justify-between gap-2">
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-3/4 rounded saker-shimmer" />
          <div className="h-2.5 w-1/2 rounded saker-shimmer" />
        </div>
        <div className="w-6 h-6 rounded-full saker-shimmer shrink-0" />
      </div>
    </div>
  );
};

export const HeroSpotlightSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="bg-[#FAF7F2] rounded-[14px] p-3 flex flex-col justify-between shadow-md"
    >
      <div>
        <div className="aspect-square w-full rounded-[10px] saker-shimmer mb-2.5" />
        <div className="h-2.5 w-16 rounded saker-shimmer" />
        <div className="h-3.5 w-4/5 rounded saker-shimmer mt-1.5" />
      </div>
      <div className="pt-2 mt-2 border-t border-[#E6DEC8] flex items-center justify-between gap-1.5">
        <div className="h-3.5 w-16 rounded saker-shimmer" />
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg saker-shimmer shrink-0" />
      </div>
    </div>
  );
};

export const FaqSkeleton: React.FC = () => {
  return (
    <div aria-hidden="true" className="space-y-3">
      {[0, 1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="rounded-[14px] border border-[#E6DEC8] bg-white p-4 sm:p-5 flex items-center justify-between gap-4"
        >
          <div className="h-4 w-3/4 rounded saker-shimmer" />
          <div className="w-5 h-5 rounded-full saker-shimmer shrink-0" />
        </div>
      ))}
    </div>
  );
};
