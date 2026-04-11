import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/*
 * POCHAK Button System — "Athletic Edge"
 *
 * Not pill, not square. Sharp-ish corners (rounded-lg, 8px)
 * with directional hover animations and accent-line details.
 *
 * Primary CTA: gradient green with subtle left glow
 * Secondary: bordered with green-tinted hover fill
 * Action: glass bg with slide-in highlight
 * All: tight tracking, bold weight, snappy feedback
 */
const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2",
    "whitespace-nowrap select-none overflow-hidden",
    "font-semibold tracking-[-0.02em]",
    "transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-30",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "active:scale-[0.97] active:duration-75",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ── Primary: gradient green + glow on hover ── */
        cta: [
          "rounded-lg bg-gradient-to-r from-primary to-pochak-accent-bright text-primary-foreground font-bold",
          "hover:shadow-glow-md hover:brightness-110",
          "before:absolute before:inset-0 before:bg-white/0 hover:before:bg-white/[0.08] before:transition-colors before:duration-200",
        ].join(" "),

        /* ── Default: solid white, clean ── */
        default: [
          "rounded-lg bg-white text-primary-foreground font-bold",
          "hover:bg-white/90",
        ].join(" "),

        /* ── Secondary: ghost with border + green left accent on hover ── */
        secondary: [
          "rounded-lg border border-white/[0.08] bg-white/[0.03] text-foreground",
          "hover:border-white/[0.15] hover:bg-white/[0.07]",
          "before:absolute before:left-0 before:top-[20%] before:bottom-[20%] before:w-[2px] before:rounded-full before:bg-primary",
          "before:scale-y-0 hover:before:scale-y-100 before:transition-transform before:duration-200 before:origin-center",
        ].join(" "),

        /* ── Destructive: red ── */
        destructive: [
          "rounded-lg bg-pochak-live text-white font-bold",
          "hover:brightness-110 hover:shadow-[0_0_12px_rgba(255,45,59,0.2)]",
        ].join(" "),

        /* ── Outline: bordered, minimal ── */
        outline: [
          "rounded-lg border border-white/[0.1] text-foreground",
          "hover:bg-white/[0.05] hover:border-white/[0.2]",
        ].join(" "),

        /* ── Ghost: invisible until hover ── */
        ghost: [
          "rounded-lg text-pochak-text-secondary",
          "hover:text-foreground hover:bg-white/[0.06]",
        ].join(" "),

        /* ── Text: no bg ever ── */
        text: "text-pochak-text-secondary hover:text-foreground",

        /* ── Link ── */
        link: "text-pochak-info hover:brightness-125 hover:underline underline-offset-2",

        /* ── Icon: square-ish circle ── */
        icon: [
          "rounded-lg text-pochak-text-secondary",
          "hover:text-foreground hover:bg-white/[0.07]",
        ].join(" "),
        navIcon: [
          "rounded-lg text-pochak-text-secondary",
          "hover:text-foreground hover:bg-white/[0.07]",
        ].join(" "),

        /* ── Chip: angular tab with bottom accent ── */
        chip: [
          "rounded-lg bg-white/[0.04] text-pochak-text-secondary border border-transparent",
          "hover:bg-white/[0.08] hover:text-foreground",
          "data-[state=active]:bg-white/[0.08] data-[state=active]:text-foreground data-[state=active]:border-primary/30 data-[state=active]:font-bold",
        ].join(" "),

        /* ── Segmented ── */
        segmented: [
          "rounded-lg text-pochak-text-secondary",
          "data-[state=active]:bg-white/[0.1] data-[state=active]:text-foreground data-[state=active]:font-bold",
        ].join(" "),

        /* ── Social login ── */
        social: [
          "rounded-lg border border-white/[0.08] text-foreground",
          "hover:bg-white/[0.04] hover:border-white/[0.15]",
        ].join(" "),

        /* ── Subtle ── */
        subtle: [
          "rounded-lg bg-white/[0.03] text-pochak-text-secondary",
          "hover:bg-white/[0.08] hover:text-foreground",
        ].join(" "),

        /* ── Glass: blur bg ── */
        glass: [
          "rounded-lg bg-white/[0.1] text-white font-bold backdrop-blur-md",
          "hover:bg-white/[0.2]",
        ].join(" "),

        /* ── Action: like/share toggleable with green accent ── */
        action: [
          "rounded-lg bg-white/[0.05] text-foreground border border-white/[0.06]",
          "hover:bg-white/[0.1] hover:border-white/[0.12]",
          "data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:border-primary/25 data-[active=true]:font-bold",
        ].join(" "),

        /* ── Primary accent green (non-gradient) ── */
        primary: [
          "rounded-lg bg-primary text-primary-foreground font-bold",
          "hover:bg-pochak-accent-bright hover:shadow-glow-sm",
        ].join(" "),
      },
      size: {
        default: "h-9 px-4 text-[13px]",
        sm: "h-8 px-3 text-[12px]",
        lg: "h-11 px-6 text-[14px]",
        xl: "h-12 px-8 text-[15px]",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
