import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-24 w-full resize-none rounded-xl border border-border bg-white/65 p-4 text-sm text-foreground outline-none transition placeholder:text-foreground/45 focus:border-primary dark:bg-white/5',
        className
      )}
      {...props}
    />
  );
});
