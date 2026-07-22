import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const EditalTitleSkeleton: React.FC = () => {
  return (
    <header className="mb-4 sm:mb-6">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 hidden h-10 w-10 shrink-0 rounded-xl sm:block" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-full max-w-md sm:h-7" />
          <Skeleton className="h-5 w-4/5 max-w-sm sm:h-7" />
          <Skeleton className="h-3 w-48 sm:h-4" />
        </div>
      </div>
    </header>
  );
};

export default EditalTitleSkeleton;
