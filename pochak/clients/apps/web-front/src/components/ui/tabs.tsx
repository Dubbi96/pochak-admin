import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

/*
 * POCHAK Tabs — "Athletic Edge"
 *
 * Active tab: green left accent bar + bright text
 * Clean horizontal layout with subtle divider below
 */

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-auto items-center gap-0 bg-transparent p-0 border-b border-white/[0.06]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, style, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    style={{ paddingLeft: 16, paddingRight: 16, marginLeft: 8, marginRight: 8, ...style }}
    className={cn(
      [
        "relative inline-flex h-12 items-center justify-center text-[15px] font-bold tracking-[-0.01em] pb-1",
        "text-pochak-text-tertiary/60 transition-colors duration-200",
        "hover:text-pochak-text-secondary",
        "data-[state=active]:text-foreground",
        /* Press feedback */
        "active:scale-[0.97] active:duration-75",
      ].join(" "),
      className
    )}
    {...props}
  >
    <span className="relative inline-block">
      {children}
      {/* Green bar — matches text width only */}
      <span className="absolute left-0 right-0 -bottom-[10px] h-[2.5px] rounded-full bg-primary origin-center scale-x-0 transition-transform duration-250 [[data-state=active]>&]:scale-x-100" />
    </span>
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none animate-in fade-in-0 slide-in-from-bottom-1 duration-200",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
