import React from 'react';
import { PersianButton } from '@/components/ui/PersianButton';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends React.ComponentProps<typeof PersianButton> {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText = 'در حال پردازش...',
  children,
  disabled,
  className,
  ...props
}) => {
  return (
    <PersianButton
      disabled={disabled || loading}
      className={cn(
        loading && 'opacity-70 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && (
        <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {loading ? loadingText : children}
    </PersianButton>
  );
};