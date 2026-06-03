'use client'

import { cn } from '@/lib/utils/cn'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
type ButtonSize = 'sm' | 'default' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  isLoading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white border border-accent hover:bg-accent-deep hover:border-accent-deep',
  secondary: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white',
  ghost: 'bg-transparent text-textMuted border border-transparent hover:bg-fill',
  destructive: 'bg-error text-white border border-error hover:bg-red-700',
  outline: 'bg-transparent text-primary border border-line hover:bg-fill',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'text-xs px-3.5 py-1.5',
  default: 'text-sm px-4.5 py-2.5',
  lg: 'text-base px-6 py-3',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'default', full, isLoading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          full && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
