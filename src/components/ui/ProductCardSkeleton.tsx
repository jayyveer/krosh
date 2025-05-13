import React from 'react';
import Skeleton from './Skeleton';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 flex-1 flex flex-col">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex justify-between items-center mt-auto">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;