
import React from 'react';
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary' | 'accent';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  asChild = false,
  href,
  ...props
}) => {
  // Map our custom variants to shadcn variants
  const variantMap: Record<string, string> = {
    primary: 'bg-parkongo-600 hover:bg-parkongo-700 text-white',
    accent: 'bg-gradient-to-r from-parkongo-500 to-parkongo-600 hover:from-parkongo-600 hover:to-parkongo-700 text-white shadow-md hover:shadow-lg',
  };

  // Map our custom sizes to styles
  const sizeMap: Record<string, string> = {
    xl: 'h-14 px-8 rounded-lg text-lg',
  };

  const mappedVariant = variant in variantMap ? 'custom' : variant;
  const mappedSize = size in sizeMap ? 'custom' : size;

  const component = (
    <ShadcnButton
      className={cn(
        // Apply custom variant styles if needed
        mappedVariant === 'custom' && variantMap[variant],
        // Apply custom size styles if needed
        mappedSize === 'custom' && sizeMap[size],
        // Apply full width if needed
        fullWidth && 'w-full',
        'font-medium transition-all duration-200',
        'flex items-center justify-center gap-2',
        'relative overflow-hidden group',
        className
      )}
      variant={mappedVariant === 'custom' ? 'default' : mappedVariant}
      size={mappedSize === 'custom' ? 'default' : mappedSize}
      disabled={isLoading || disabled}
      asChild={asChild}
      {...props}
    >
      <>
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        )}
        {!isLoading && leftIcon && (
          <span className="inline-flex mr-2">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex ml-2">{rightIcon}</span>
        )}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
      </>
    </ShadcnButton>
  );

  // If href is provided and not disabled, render as anchor
  if (href && !disabled && !isLoading) {
    return (
      <a href={href} className="inline-flex">
        {component}
      </a>
    );
  }

  return component;
};

export default Button;
