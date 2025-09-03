import React from 'react';

const BookCardSkeleton = () => {
  return (
    <li className="flex gap-4 p-4 rounded-xl bg-dark-100 shadow-inner shadow-light-100/10">
      {/* Cover Skeleton */}
      <div className="w-30 h-50 bg-gradient-to-br from-light-100/10 to-light-100/5 rounded-lg animate-pulse" />

      {/* Right Column */}
      <div className="flex-1 space-y-2">
        {/* Title + Actions Skeleton */}
        <div className="flex justify-between items-start">
          <div className="h-6 bg-gradient-to-r from-light-100/15 to-light-100/5 rounded animate-pulse w-2/3" />
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-light-100/10 rounded animate-pulse" />
            <div className="w-8 h-8 bg-light-100/10 rounded animate-pulse" />
            <div className="w-8 h-8 bg-light-100/10 rounded animate-pulse" />
          </div>
        </div>

        {/* Author + Year Skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-light-100/10 rounded animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-light-100/10 to-light-100/5 rounded animate-pulse w-32" />
          <div className="w-1 h-1 bg-light-100/10 rounded-full animate-pulse" />
          <div className="w-4 h-4 bg-light-100/10 rounded animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-light-100/10 to-light-100/5 rounded animate-pulse w-12" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-1">
          <div className="h-4 bg-gradient-to-r from-light-100/8 to-light-100/3 rounded animate-pulse w-full" />
          <div className="h-4 bg-gradient-to-r from-light-100/8 to-light-100/3 rounded animate-pulse w-3/4" />
        </div>

        {/* Genre Skeleton */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gradient-to-r from-[#D6C7FF]/20 to-[#AB8BFF]/10 rounded-full animate-pulse w-20" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="h-5 bg-light-100/8 rounded-full animate-pulse w-16" />
          <div className="h-5 bg-light-100/8 rounded-full animate-pulse w-12" />
          <div className="h-5 bg-light-100/8 rounded-full animate-pulse w-20" />
        </div>

        {/* Progress Skeleton */}
        <div className="mt-3 space-y-1">
          <div className="h-2 bg-light-100/10 rounded-full animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-light-100/8 to-light-100/3 rounded animate-pulse w-24" />
        </div>
      </div>
    </li>
  );
};

const BookSkeletonLoader = ({ count = 6 }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center py-4">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-8 w-8 border-4 border-[#AB8BFF]/30 border-t-[#AB8BFF] rounded-full animate-spin" />
            <div className="absolute inset-0 h-8 w-8 border-4 border-transparent border-r-[#D6C7FF] rounded-full animate-spin" 
                 style={{ animationDelay: '150ms' }} />
          </div>
          <p className="text-sm text-white animate-pulse">Chargement de votre bibliothèque...</p>
        </div>
      </div>
      
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: count }, (_, index) => (
          <BookCardSkeleton key={index} />
        ))}
      </ul>
    </div>
  );
};

export default BookSkeletonLoader;