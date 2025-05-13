
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const EditalHeaderSkeleton: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-6"
    >
      <div className='flex items-center mb-4'>
        <Skeleton className="h-10 w-10 rounded-full mr-3" />
        <div className='flex-grow'>
          {/* Breadcrumb skeleton */}
          <div className='flex items-center'>
            <Skeleton className="h-4 w-20 mr-1" />
            <Skeleton className="h-4 w-4 rounded-full mx-1" />
            <Skeleton className="h-4 w-24 mr-1" />
            <Skeleton className="h-4 w-4 rounded-full mx-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
        <div className="flex-1">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-[180px] rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
};

export default EditalHeaderSkeleton;
