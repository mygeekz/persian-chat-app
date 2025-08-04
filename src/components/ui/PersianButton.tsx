import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PersianButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
}

export const PersianButton: React.FC<PersianButtonProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <Button
      className={cn(
        'font-vazir text-sm',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};