import React from 'react';

const QuoteCardSkeleton = () => {
    return (
      <div className="bg-gradient-to-br from-dark-100/70 to-purple-900/20 border border-light-100/20 rounded-xl p-6 animate-pulse">
        {/* Book Info Header Skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-16 bg-gradient-to-br from-light-100/10 to-light-100/5 rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gradient-to-r from-light-100/15 to-light-100/5 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-gradient-to-r from-light-100/10 to-light-100/5 rounded animate-pulse w-1/2" />
            <div className="flex gap-2 mt-1">
              <div className="h-5 bg-light-100/10 rounded-full animate-pulse w-16" />
              <div className="h-5 bg-light-100/10 rounded-full animate-pulse w-20" />
            </div>
          </div>
          <div className="w-8 h-8 bg-light-100/10 rounded animate-pulse" />
        </div>
  
        {/* Quote Text Skeleton */}
        <div className="mb-4 space-y-2 pl-6">
          <div className="h-5 bg-gradient-to-r from-light-100/12 to-light-100/6 rounded animate-pulse w-full" />
          <div className="h-5 bg-gradient-to-r from-light-100/12 to-light-100/6 rounded animate-pulse w-5/6" />
          <div className="h-5 bg-gradient-to-r from-light-100/12 to-light-100/6 rounded animate-pulse w-4/5" />
          <div className="h-4 bg-gradient-to-r from-light-100/8 to-light-100/4 rounded animate-pulse w-16 mt-2" />
        </div>
  
        {/* Quote Details Skeleton */}
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-light-100/10 rounded animate-pulse" />
            <div className="h-3 bg-gradient-to-r from-light-100/8 to-light-100/4 rounded animate-pulse w-12" />
          </div>
          <div className="h-5 bg-light-100/10 rounded-full animate-pulse w-16" />
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-light-100/10 rounded animate-pulse" />
            <div className="h-3 bg-gradient-to-r from-light-100/8 to-light-100/4 rounded animate-pulse w-20" />
          </div>
        </div>
  
        {/* Notes Skeleton (always shown now) */}
        <div className="bg-dark-100/60 border border-light-100/10 rounded-lg p-3 space-y-2 mb-4">
          <div className="h-3 bg-gradient-to-r from-light-100/10 to-light-100/5 rounded animate-pulse w-16" />
          <div className="h-4 bg-gradient-to-r from-light-100/8 to-light-100/4 rounded animate-pulse w-3/4" />
        </div>
  
        {/* Additional Book Info Skeleton */}
        <div className="pt-3 border-t border-light-100/10">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-3 bg-gradient-to-r from-light-100/8 to-light-100/4 rounded animate-pulse w-full" />
            <div className="h-3 bg-gradient-to-r from-light-100/8 to-light-100/4 rounded animate-pulse w-full" />
            <div className="h-3 bg-gradient-to-r from-light-100/8 to-light-100/4 rounded animate-pulse w-full" />
            <div className="h-3 bg-gradient-to-r from-light-100/8 to-light-100/4 rounded animate-pulse w-3/4 flex items-center gap-1">
              <div className="w-3 h-3 bg-light-100/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  };

const WishlistItemSkeleton = () => {
  return (
    <div className="bg-dark-100/50 border border-light-100/20 rounded-xl p-4 animate-pulse">
      <div className="flex gap-4">
        {/* Cover Skeleton */}
        <div className="w-16 h-24 bg-gradient-to-br from-light-100/10 to-light-100/5 rounded-lg animate-pulse flex-shrink-0" />

        {/* Content Skeleton */}
        <div className="flex-1 space-y-3">
          {/* Title and Actions */}
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gradient-to-r from-light-100/15 to-light-100/5 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gradient-to-r from-light-100/10 to-light-100/5 rounded animate-pulse w-1/2" />
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-light-100/10 rounded animate-pulse" />
              <div className="w-8 h-8 bg-light-100/10 rounded animate-pulse" />
            </div>
          </div>

          {/* Genre and Details */}
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gradient-to-r from-[#D6C7FF]/20 to-[#AB8BFF]/10 rounded-full animate-pulse w-20" />
            <div className="w-1 h-1 bg-light-100/10 rounded-full animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-light-100/8 to-light-100/4 rounded animate-pulse w-16" />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <div className="h-3 bg-gradient-to-r from-light-100/8 to-light-100/3 rounded animate-pulse w-full" />
            <div className="h-3 bg-gradient-to-r from-light-100/8 to-light-100/3 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchResultSkeleton = () => {
  return (
    <div className="bg-dark-100/40 border border-light-100/10 rounded-lg p-4 animate-pulse">
      <div className="flex gap-3">
        {/* Small Cover */}
        <div className="w-12 h-16 bg-gradient-to-br from-light-100/10 to-light-100/5 rounded animate-pulse flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gradient-to-r from-light-100/12 to-light-100/6 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gradient-to-r from-light-100/8 to-light-100/4 rounded animate-pulse w-1/2" />
          <div className="flex gap-2">
            <div className="h-4 bg-light-100/8 rounded-full animate-pulse w-12" />
            <div className="h-4 bg-light-100/8 rounded-full animate-pulse w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

const WishlistSkeletonLoader = ({ type = 'quote', count = 6, message = 'Chargement...' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'quote':
        return Array.from({ length: count }, (_, index) => (
          <QuoteCardSkeleton key={index} />
        ));
      case 'wishlist':
        return Array.from({ length: count }, (_, index) => (
          <WishlistItemSkeleton key={index} />
        ));
      case 'search':
        return Array.from({ length: count }, (_, index) => (
          <SearchResultSkeleton key={index} />
        ));
      default:
        return Array.from({ length: count }, (_, index) => (
          <QuoteCardSkeleton key={index} />
        ));
    }
  };

  return (
    <div className="space-y-4">
      {/* Loading Indicator */}
      <div className="flex items-center justify-center py-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {/* Outer ring */}
            <div className="h-8 w-8 border-4 border-[#AB8BFF]/30 border-t-[#AB8BFF] rounded-full animate-spin" />
            {/* Inner ring */}
            <div className="absolute inset-0 h-8 w-8 border-4 border-transparent border-r-[#D6C7FF] rounded-full animate-spin" 
                 style={{ animationDelay: '150ms', animationDuration: '1.2s' }} />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-[#AB8BFF] rounded-full animate-pulse" 
                   style={{ animationDelay: '300ms' }} />
            </div>
          </div>
          <p className="text-sm text-white animate-pulse">{message}</p>
        </div>
      </div>
      
      {/* Skeleton Cards */}
      <div className={`space-y-4 ${type === 'search' ? 'max-h-96 overflow-y-auto' : ''}`}>
        {renderSkeleton()}
      </div>

      {/* Additional loading dots for search */}
      {type === 'search' && (
        <div className="flex justify-center py-4">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-[#AB8BFF] rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-[#AB8BFF] rounded-full animate-bounce" 
                 style={{ animationDelay: '100ms' }} />
            <div className="w-2 h-2 bg-[#AB8BFF] rounded-full animate-bounce" 
                 style={{ animationDelay: '200ms' }} />
          </div>
        </div>
      )}
    </div>
  );
};

// Individual skeleton exports for specific use cases
export { QuoteCardSkeleton, WishlistItemSkeleton, SearchResultSkeleton };

// Main export
export default WishlistSkeletonLoader;