"use client"
import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  count: number
  className?: string
  maxCount?: number
}

export function NotificationBadge({ count, className, maxCount = 99 }: NotificationBadgeProps) {
  if (count <= 0) return null

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString()

  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse",
        count > 0 && "animate-bounce-subtle",
        className,
      )}
    >
      {displayCount}
    </div>
  )
}
