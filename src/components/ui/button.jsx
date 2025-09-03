import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.98] transform",
  {
    variants: {
      variant: {
        default:
          "bg-light-100 text-dark-100 font-semibold tracking-wide shadow-lg shadow-light-100/10 hover:bg-white hover:text-primary hover:shadow-2xl hover:shadow-white/60 focus-visible:ring-light-100/50 border border-light-100/5 hover:border-white/30 rounded-md hover:[box-shadow:_0_0_30px_rgba(255,255,255,0.4)]",
        
        primary:
          "bg-light-100 text-primary font-bold tracking-wide shadow-lg shadow-light-100/20 hover:bg-gradient-to-r hover:from-white hover:to-light-100 hover:shadow-2xl hover:shadow-white/70 hover:scale-105 focus-visible:ring-light-100/50 rounded-md hover:[box-shadow:_0_0_40px_rgba(255,255,255,0.5)]",
        
        secondary:
          "bg-dark-100 text-light-100 font-semibold tracking-wide shadow-inner shadow-light-100/10 hover:bg-light-200 hover:text-primary hover:shadow-xl hover:shadow-light-200/60 focus-visible:ring-light-100/40 border border-light-100/10 hover:border-light-200/50 rounded-lg hover:[box-shadow:_0_0_25px_rgba(168,181,219,0.5)]",
        
        gradient:
          "bg-dark-100 text-light-100 font-bold tracking-wide shadow-lg shadow-light-100/15 hover:bg-gradient-to-r hover:from-light-100 hover:to-light-200 hover:text-primary hover:shadow-2xl hover:shadow-light-200/70 hover:scale-105 focus-visible:ring-light-200/50 rounded-lg border border-light-100/10 hover:border-light-200/40 hover:[box-shadow:_0_0_35px_rgba(206,206,251,0.6)]",
        
        "gradient-bright":
          "bg-dark-100 text-light-100 font-bold tracking-wide shadow-lg shadow-light-100/15 hover:bg-gradient-to-r hover:from-white hover:via-light-100 hover:to-white hover:text-primary hover:shadow-2xl hover:shadow-white/80 hover:scale-110 focus-visible:ring-white/60 rounded-lg border border-light-100/10 hover:border-white/50 hover:[box-shadow:_0_0_50px_rgba(255,255,255,0.7)]",
        
        "gradient-aurora":
          "bg-dark-100 text-light-100 font-bold tracking-wide shadow-lg shadow-light-100/15 hover:bg-gradient-to-r hover:from-cyan-200 hover:via-purple-200 hover:to-pink-200 hover:text-slate-800 hover:shadow-2xl hover:shadow-purple-300/70 hover:scale-110 focus-visible:ring-purple-300/60 rounded-lg border border-light-100/10 hover:border-purple-200/50 hover:[box-shadow:_0_0_40px_rgba(147,51,234,0.5)]",
        
        "gradient-rainbow":
          "bg-dark-100 text-light-100 font-bold tracking-wide shadow-lg shadow-light-100/15 hover:bg-gradient-to-r hover:from-red-200 hover:via-yellow-200 hover:via-green-200 hover:via-blue-200 hover:to-purple-200 hover:text-slate-800 hover:shadow-2xl hover:shadow-purple-300/70 hover:scale-110 focus-visible:ring-purple-300/60 rounded-lg border border-light-100/10 hover:border-purple-200/50 hover:[box-shadow:_0_0_45px_rgba(147,51,234,0.6)]",
        
        outline:
          "border-2 border-light-200/40 bg-transparent text-light-100 font-semibold tracking-wide hover:bg-white hover:border-white hover:text-primary hover:shadow-2xl hover:shadow-white/60 focus-visible:ring-light-200/50 rounded-md backdrop-blur-sm hover:[box-shadow:_0_0_30px_rgba(255,255,255,0.4)]",
        
        "outline-glow":
          "border-2 border-light-200/40 bg-transparent text-light-100 font-semibold tracking-wide hover:bg-gradient-to-r hover:from-light-100/20 hover:to-white/20 hover:border-light-100 hover:text-white hover:shadow-2xl hover:shadow-light-100/70 focus-visible:ring-light-100/60 rounded-md backdrop-blur-sm hover:[box-shadow:_0_0_35px_rgba(206,206,251,0.6)]",
        
        ghost:
          "text-light-100 font-medium tracking-wide hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-white/30 focus-visible:ring-light-100/30 rounded-md hover:[box-shadow:_0_0_20px_rgba(255,255,255,0.3)]",
        
        "ghost-bright":
          "text-light-100 font-medium tracking-wide hover:bg-white/15 hover:text-primary hover:shadow-xl hover:shadow-white/50 focus-visible:ring-white/40 rounded-md backdrop-blur-sm hover:[text-shadow:_0_0_10px_rgba(255,255,255,0.8)] hover:[box-shadow:_0_0_25px_rgba(255,255,255,0.4)]",
        
        card:
          "bg-dark-100 text-light-100 font-medium tracking-wide rounded-2xl shadow-inner shadow-light-100/10 hover:bg-light-100/15 hover:text-white hover:shadow-xl hover:shadow-light-100/40 focus-visible:ring-light-100/30 border border-light-100/5 hover:border-light-100/20 backdrop-blur-sm hover:[box-shadow:_inset_0_0_20px_rgba(206,206,251,0.2),_0_0_30px_rgba(206,206,251,0.3)]",
        
        "card-luminous":
          "bg-dark-100 text-light-100 font-medium tracking-wide rounded-2xl shadow-inner shadow-light-100/10 hover:bg-gradient-to-br hover:from-white/10 hover:to-light-100/10 hover:text-white hover:shadow-2xl hover:shadow-white/50 focus-visible:ring-white/40 border border-light-100/5 hover:border-white/30 backdrop-blur-md hover:[box-shadow:_inset_0_0_30px_rgba(255,255,255,0.2),_0_0_40px_rgba(255,255,255,0.4)]",
        
        fancy:
          "bg-dark-100 text-light-100 font-['Bebas_Neue'] text-lg font-bold tracking-widest shadow-inner shadow-light-100/15 hover:bg-light-200/20 hover:text-white hover:shadow-xl hover:shadow-light-200/50 focus-visible:ring-light-100/40 border border-light-100/10 hover:border-light-200/40 rounded-lg [text-shadow:_2px_2px_4px_rgba(206,206,251,0.3)] hover:[text-shadow:_0_0_15px_rgba(206,206,251,0.8),_2px_2px_8px_rgba(206,206,251,0.5)] hover:[box-shadow:_0_0_30px_rgba(206,206,251,0.5)]",
        
        "fancy-glow":
          "bg-dark-100 text-light-100 font-['Bebas_Neue'] text-xl font-bold tracking-[0.2em] shadow-lg shadow-light-100/20 hover:bg-gradient-to-r hover:from-light-100/15 hover:to-white/15 hover:text-white hover:shadow-2xl hover:shadow-white/60 focus-visible:ring-white/50 border border-light-100/20 hover:border-white/40 rounded-xl [text-shadow:_0_0_10px_rgba(206,206,251,0.4)] hover:[text-shadow:_0_0_25px_rgba(255,255,255,0.9)] hover:[box-shadow:_0_0_50px_rgba(255,255,255,0.6)]",
        
        neon:
          "bg-transparent text-light-100 font-bold tracking-wider border-2 border-light-100/60 hover:border-white hover:text-white hover:bg-white/5 hover:shadow-[0_0_50px_rgba(255,255,255,0.7)] focus-visible:ring-white/60 rounded-lg [text-shadow:_0_0_8px_rgba(206,206,251,0.3)] hover:[text-shadow:_0_0_20px_rgba(255,255,255,0.9)] backdrop-blur-sm",
        
        "neon-rainbow":
          "bg-transparent text-light-100 font-bold tracking-wider border-2 border-light-100/60 hover:border-purple-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:shadow-[0_0_40px_rgba(147,51,234,0.8)] focus-visible:ring-purple-400/60 rounded-lg [text-shadow:_0_0_8px_rgba(206,206,251,0.3)] hover:[text-shadow:_0_0_20px_rgba(147,51,234,0.9)] backdrop-blur-sm",
        
        glass:
          "bg-light-100/10 text-light-100 font-medium tracking-wide backdrop-blur-md border border-light-100/20 hover:bg-white/20 hover:border-white/40 hover:text-white hover:shadow-2xl hover:shadow-white/40 focus-visible:ring-white/40 rounded-xl shadow-lg shadow-light-100/5 hover:[box-shadow:_0_0_35px_rgba(255,255,255,0.4)]",
        
        "glass-shimmer":
          "bg-light-100/10 text-light-100 font-medium tracking-wide backdrop-blur-md border border-light-100/20 hover:bg-gradient-to-r hover:from-white/15 hover:to-light-100/15 hover:border-white/40 hover:text-white hover:shadow-2xl hover:shadow-white/50 focus-visible:ring-white/40 rounded-xl shadow-lg shadow-light-100/5 relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-white/30 hover:before:to-transparent hover:before:translate-x-[-100%] hover:before:animate-[shimmer_0.7s_ease-out] hover:[box-shadow:_0_0_40px_rgba(255,255,255,0.5)]",
        
        shimmer:
          "bg-dark-100 text-light-100 font-bold tracking-wide shadow-lg shadow-light-100/15 hover:bg-gradient-to-r hover:from-light-100 hover:to-light-200 hover:text-primary hover:shadow-2xl hover:shadow-light-200/70 focus-visible:ring-light-200/50 rounded-lg border border-light-100/10 hover:border-light-200/40 relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-white/40 hover:before:to-transparent hover:before:translate-x-[-100%] hover:before:animate-[shimmer_0.8s_ease-out] hover:[box-shadow:_0_0_45px_rgba(255,255,255,0.6)]",
        
        crystal:
          "bg-dark-100 text-light-100 font-bold tracking-wide shadow-lg shadow-light-100/15 hover:bg-gradient-to-br hover:from-white/15 hover:via-light-100/10 hover:to-white/15 hover:text-primary hover:shadow-2xl hover:shadow-white/70 hover:scale-105 focus-visible:ring-white/60 rounded-xl border border-light-100/10 hover:border-white/40 backdrop-blur-lg hover:[background-image:_radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.3),_transparent_70%)] hover:[box-shadow:_0_0_50px_rgba(255,255,255,0.6)]",
        
        aurora:
          "bg-dark-100 text-light-100 font-bold tracking-wide shadow-lg shadow-light-100/15 hover:bg-gradient-to-r hover:from-cyan-100 hover:via-purple-100 hover:to-pink-100 hover:text-slate-800 hover:shadow-2xl hover:shadow-cyan-200/60 hover:scale-105 focus-visible:ring-cyan-200/60 rounded-lg border border-light-100/10 hover:border-cyan-200/50 hover:[box-shadow:_0_0_40px_rgba(34,211,238,0.5)] hover:[background-size:_200%_200%] hover:animate-pulse",
        
        floating:
          "bg-dark-100 text-light-100 font-medium tracking-wide shadow-2xl shadow-dark-100/40 hover:bg-gradient-to-r hover:from-light-100/20 hover:to-white/20 hover:text-white hover:shadow-2xl hover:shadow-white/50 focus-visible:ring-white/40 border border-light-100/10 hover:border-white/30 rounded-full hover:-translate-y-2 hover:[box-shadow:_0_10px_50px_rgba(255,255,255,0.4)]",
        
        // Status variants with light effects
        destructive:
          "bg-red-600 text-white font-semibold hover:bg-red-500 focus-visible:ring-red-400/50 rounded-md",

        success:
          "bg-emerald-600/90 text-white font-semibold tracking-wide shadow-lg shadow-emerald-600/20 hover:bg-gradient-to-r hover:from-emerald-300 hover:to-green-300 hover:text-emerald-900 hover:shadow-2xl hover:shadow-emerald-300/60 hover:scale-104 focus-visible:ring-emerald-300/50  hover:border-emerald-200/50 rounded-md hover:[box-shadow:_0_0_30px_rgba(52,211,153,0.6)]",
        
        warning:
          "bg-amber-600/90 text-white font-semibold tracking-wide shadow-lg shadow-amber-600/20 hover:bg-gradient-to-r hover:from-amber-300 hover:to-yellow-300 hover:text-amber-900 hover:shadow-2xl hover:shadow-amber-300/60 hover:scale-105 focus-visible:ring-amber-300/50 border border-amber-500/20 hover:border-amber-200/50 rounded-md hover:[box-shadow:_0_0_30px_rgba(251,191,36,0.6)]",
        
        link:
          "text-light-200 font-medium tracking-wide underline-offset-4 hover:underline hover:text-white hover:[text-shadow:_0_0_15px_rgba(255,255,255,0.8)] focus-visible:ring-white/30 rounded-sm",
        
        muted:
          "bg-gray-100/20 text-light-200 font-medium tracking-wide hover:bg-white/15 hover:text-white hover:shadow-lg hover:shadow-white/30 focus-visible:ring-white/30 rounded-md border border-gray-100/10 hover:border-white/20 hover:[box-shadow:_0_0_20px_rgba(255,255,255,0.3)]",
      },
      size: {
        xs: "h-7 px-2.5 text-xs gap-1 has-[>svg]:px-2",
        sm: "h-8 px-3 text-xs gap-1.5 has-[>svg]:px-2.5",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-11 px-6 text-base has-[>svg]:px-4",
        xl: "h-12 px-8 text-lg has-[>svg]:px-6",
        "2xl": "h-14 px-10 text-xl has-[>svg]:px-8",
        "3xl": "h-16 px-12 text-2xl has-[>svg]:px-10",
        icon: "size-9 rounded-md",
        "icon-xs": "size-7 rounded-sm",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11 rounded-lg",
        "icon-xl": "size-12 rounded-lg",
        "icon-2xl": "size-14 rounded-xl",
        "icon-3xl": "size-16 rounded-2xl",
        wide: "h-9 px-8 py-2 has-[>svg]:px-6",
        "wide-lg": "h-11 px-12 text-base has-[>svg]:px-10",
        "wide-xl": "h-12 px-16 text-lg has-[>svg]:px-12",
        full: "w-full h-11 px-6 text-base has-[>svg]:px-4",
        "full-lg": "w-full h-12 px-8 text-lg has-[>svg]:px-6",
        "full-xl": "w-full h-14 px-10 text-xl has-[>svg]:px-8",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        "3xl": "rounded-3xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  },
)

function Button({ className, variant, size, rounded, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button"

  return <Comp 
    data-slot="button" 
    className={cn(buttonVariants({ variant, size, rounded }), className)} 
    {...props} 
  />
}

Button.displayName = "Button"

// Add keyframes for animations (add to your CSS file)
const animations = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`

export { Button, buttonVariants, animations }