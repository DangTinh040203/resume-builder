import { cn } from '@resume-builder/ui/lib/utils';
import * as React from 'react';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        `
          file:text-foreground file:inline-flex file:h-7 file:border-0
          file:bg-transparent file:text-sm file:font-medium
          placeholder:text-muted-foreground
          selection:bg-primary selection:text-primary-foreground
          dark:bg-input/30
          border-input h-12 w-full min-w-0 rounded-full border bg-transparent
          px-6 py-1 text-base shadow-xs transition-[color,box-shadow]
          outline-none
          disabled:pointer-events-none disabled:cursor-not-allowed
          disabled:opacity-50
          md:text-sm
        `,
        `
          focus-visible:border-ring focus-visible:ring-primary
          focus-visible:ring-[2px]
        `,
        `
          aria-invalid:ring-destructive/20 aria-invalid:border-destructive
          dark:aria-invalid:ring-destructive/40
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Input };
