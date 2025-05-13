
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const EditalTitleSkeleton: React.FC = () => {
  return (
    <Card className="mb-8 border-none shadow-none bg-white">
      <CardContent className="p-6 pt-6">
        <div className="flex items-center mb-4">
          <Skeleton className="h-14 w-14 rounded-full mr-4" />
          <div>
            <Skeleton className="h-8 w-[250px] mb-2" />
            <Skeleton className="h-4 w-[180px]" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 rounded-full mr-2" />
            <div>
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 rounded-full mr-2" />
            <div>
              <Skeleton className="h-3 w-36 mb-1" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 rounded-full mr-2" />
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditalTitleSkeleton;
