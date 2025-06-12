// components/ui/pagination.tsx

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Pagination({ children, className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav role="navigation" aria-label="pagination" className={cn('flex justify-center', className)}>
      {children}
    </nav>
  );
}

export function PaginationContent({ children, className }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('inline-flex items-center space-x-1', className)}>{children}</ul>;
}

export function PaginationItem({ children, className }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={className}>{children}</li>;
}

export function PaginationLink({
  className,
  isActive,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-primary text-white'
          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    />
  );
}

export function PaginationPrevious(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <PaginationLink {...props} className={cn('me-2', props.className)}>
      ← Previous
    </PaginationLink>
  );
}

export function PaginationNext(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <PaginationLink {...props} className={cn('ms-2', props.className)}>
      Next →
    </PaginationLink>
  );
}
