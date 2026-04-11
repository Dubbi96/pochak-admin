import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide select-none transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/12 text-primary",
        secondary: "bg-white/[0.06] text-pochak-text-secondary",
        destructive: "bg-pochak-live/15 text-pochak-live",
        outline: "border border-white/[0.1] text-foreground",
        live: "bg-pochak-live text-white font-bold tracking-wider uppercase",
        vod: "bg-primary/12 text-primary",
        clip: "bg-pochak-clip/15 text-pochak-clip",
        free: "bg-white/[0.08] text-white",
        ad: "bg-white/[0.04] text-pochak-text-tertiary",
        scheduled: "bg-white/[0.06] text-pochak-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
