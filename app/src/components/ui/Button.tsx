import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          variant === 'primary' && 'bg-emerald-500 text-black hover:bg-emerald-400',
          variant === 'secondary' && 'bg-gray-700 text-white hover:bg-gray-600',
          variant === 'ghost' && 'text-gray-400 hover:text-white',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-5 py-2.5 text-sm',
          size === 'lg' && 'px-8 py-3 text-base',
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
