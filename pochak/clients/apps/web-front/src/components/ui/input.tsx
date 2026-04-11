import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          [
            "flex h-11 w-full rounded-xl",
            "border border-white/[0.06] bg-white/[0.03]",
            "text-[15px] text-foreground tracking-tight",
            "placeholder:text-pochak-text-muted",
            "transition-all duration-200",
            "hover:border-white/[0.12] hover:bg-white/[0.05]",
            "focus-visible:outline-none focus-visible:border-primary/40 focus-visible:bg-white/[0.05] focus-visible:shadow-[0_0_0_3px_rgba(15,202,92,0.08)]",
            "disabled:cursor-not-allowed disabled:opacity-35",
          ].join(" "),
          className
        )}
        style={{ paddingLeft: 16, paddingRight: 16, ...style }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
