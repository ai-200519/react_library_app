import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styling to match dark aesthetic
        "w-full bg-light-100/5 text-gray-200 placeholder-light-200 rounded-lg px-3 py-1 text-sm outline-none",
        "selection:bg-[#AB8BFF] selection:text-primary-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}

export { Input };
