import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M3.93335 8.5C3.93335 8.5 7.93335 11.5 12.4334 11.5C16.9334 11.5 20.4334 8.5 20.4334 8.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3.93335 15.5C3.93335 15.5 7.93335 12.5 12.4334 12.5C16.9334 12.5 20.4334 15.5 20.4334 15.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12 21.5C14.7614 21.5 17 17.1797 17 12C17 6.8203 14.7614 2.5 12 2.5C9.23858 2.5 7 6.8203 7 12C7 17.1797 9.23858 21.5 12 21.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <span className="font-headline text-xl font-bold text-foreground">
        McBaller
      </span>
    </div>
  );
}
