import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-[#AB8BFF] animate-pulse rounded-md", className)}
      {...props} />
  );
}

export { Skeleton }
