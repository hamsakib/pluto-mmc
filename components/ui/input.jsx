import { cn } from '@/lib/utils'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-2.5 text-sm text-white placeholder:text-[#555] transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}
