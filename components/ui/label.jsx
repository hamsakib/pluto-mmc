import { cn } from '@/lib/utils'

export function Label({ className, children, ...props }) {
  return (
    <label
      className={cn('block text-sm font-medium text-[#ccc] mb-1.5', className)}
      {...props}
    >
      {children}
    </label>
  )
}
