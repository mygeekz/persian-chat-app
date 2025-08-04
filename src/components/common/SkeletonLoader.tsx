import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
};

export const ChatSkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-xs space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className={`h-8 ${i % 2 === 0 ? 'w-32' : 'w-40'}`} />
        </div>
      </div>
    ))}
  </div>
);

export const TasksSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, columnIndex) => (
      <div key={columnIndex} className="space-y-4">
        <Skeleton className="h-8 w-24" />
        {Array.from({ length: 3 }).map((_, cardIndex) => (
          <div key={cardIndex} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    ))}
  </div>
);

export const FilesSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export const SettingsSkeleton: React.FC = () => (
  <div className="max-w-2xl space-y-8">
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
    
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);