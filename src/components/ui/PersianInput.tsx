import React from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface PersianInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
  isNumbers?: boolean;
}

export const PersianInput: React.FC<PersianInputProps> = ({ 
  label, 
  error, 
  isNumbers = false,
  className, 
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground font-vazir">
          {label}
        </label>
      )}
      <Input
        className={cn(
          'font-vazir text-right',
          isNumbers && 'numbers-ltr',
          error && 'border-destructive',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive font-vazir">{error}</p>
      )}
    </div>
  );
};