import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const iconSizes = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-lg",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Structural geometric logo representing Flow and Asset nodes */}
      <div className={`relative flex items-center justify-center rounded bg-primary text-primary-foreground font-mono font-bold shadow-sm transition-all duration-200 ${iconSizes[size]}`}>
        <span className="relative z-10">A</span>
        {/* Decorative subtle inner border */}
        <div className="absolute inset-0.5 rounded-[3px] border border-primary-foreground/10" />
        {/* Small operational dynamic indicator node */}
        <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background bg-indigo-600 dark:bg-indigo-400 shadow-xs" />
      </div>
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`font-sans font-semibold tracking-tight text-foreground ${textSizes[size]}`}>
            Asset<span className="text-indigo-600 dark:text-indigo-400 font-medium">Flow</span>
          </span>
          <span className="text-[9px] font-mono font-bold px-1 py-0.2 bg-muted text-muted-foreground rounded uppercase tracking-wider border border-border">
            v1.0
          </span>
        </div>
      )}
    </div>
  );
}
export default Logo;
