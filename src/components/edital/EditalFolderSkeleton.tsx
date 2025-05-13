
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const EditalFolderSkeleton: React.FC = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <Card key={item} className="mb-3 border border-gray-100 shadow-sm">
            <div className="p-4">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="flex-grow">
                  <Skeleton className="h-5 w-[80%] mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-[30%]" />
                    <Skeleton className="h-3 w-3 rounded-full mx-1" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-[20%]" />
                  </div>
                </div>
                <Skeleton className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[45%] pl-6">
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="w-[15%]">
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="w-[20%]">
              <Skeleton className="h-4 w-28" />
            </TableHead>
            <TableHead className="w-[20%]">
              <Skeleton className="h-4 w-32" />
            </TableHead>
            <TableHead className="w-[10%] text-right pr-6">
              <Skeleton className="h-4 w-14 ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <TableRow key={item}>
              <TableCell className="pl-6 py-4">
                <div className="flex items-center">
                  <Skeleton className="min-w-10 min-h-10 rounded-full mr-3" />
                  <Skeleton className="h-5 w-[80%]" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 items-center">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[80%]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[80%]" />
              </TableCell>
              <TableCell className="text-right pr-6">
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EditalFolderSkeleton;
