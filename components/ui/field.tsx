import { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A single form field: label + control + optional error, wired for
 * accessibility (label htmlFor, aria-invalid, aria-describedby). Building
 * one FieldShell keeps every input/select/textarea in the form visually and
 * behaviorally consistent without repeating the same markup three times.
 */

function FieldLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-semibold text-ink", className)}
      {...props}
    />
  );
}

const controlClasses =
  "w-full rounded-sm border border-line bg-white px-3.5 h-12 text-base text-ink placeholder:text-muted/70 " +
  "focus:border-harbor focus:outline-none focus:ring-2 focus:ring-harbor/15 transition-colors";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(controlClasses, error && "border-route", className)}
    aria-invalid={Boolean(error)}
    {...props}
  />
));
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, error, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(controlClasses, "pr-9", error && "border-route", className)}
    aria-invalid={Boolean(error)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(controlClasses, "h-auto min-h-[110px] py-3 resize-y", error && "border-route", className)}
    aria-invalid={Boolean(error)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 font-mono text-xs text-route" role="alert">
      {children}
    </p>
  );
}

export { FieldLabel, Input, Select, Textarea, FieldError };
