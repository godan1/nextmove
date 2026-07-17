import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "default" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-route text-white hover:bg-route-dark shadow-sm",
  secondary: "bg-transparent text-harbor border border-harbor hover:bg-harbor/5",
  ghost: "bg-transparent text-ink hover:bg-ink/5"
};

const sizeClasses: Record<Size, string> = {
  default: "h-12 px-5 text-sm md:h-11",
  lg: "h-14 px-7 text-base"
};

/** Shared classes so a styled <Link> (header/footer CTAs) can match a real <button> exactly. */
export function buttonVariants(variant: Variant = "primary", size: Size = "default", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-colors duration-150",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button ref={ref} className={buttonVariants(variant, size, className)} {...props} />
    );
  }
);
Button.displayName = "Button";
