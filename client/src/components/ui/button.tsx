import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-foreground px-4 text-sm font-medium text-background shadow-sm transition hover:scale-[1.01] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950',
        className
      )}
      {...props}
    />
  );
}
