import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex bg-dark-100/40 rounded-lg p-[2px] gap-1",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-9 items-center justify-center px-4 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        "text-light-100 bg-dark-100 border border-light-100/10",
        "data-[state=active]:bg-light-200 data-[state=active]:text-primary",
        "hover:bg-light-100 hover:text-primary",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      className={cn("flex-1 outline-none text-light-100", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
