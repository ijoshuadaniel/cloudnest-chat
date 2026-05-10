import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-border bg-white/55 px-3 text-sm text-foreground outline-none transition placeholder:text-foreground/45 focus:border-primary dark:bg-white/5',
        className
      )}
      {...props}
    />
  );
}
