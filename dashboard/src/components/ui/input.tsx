import * as React from "react";

import { cn } from "./utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles - white background for active inputs
        "flex h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base",
        // Background: white when active, grey when disabled
        "bg-white dark:bg-gray-800",
        // Border: subtle grey default
        "border-gray-300 dark:border-gray-600",
        // Focus state: blue ring and border
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        // Placeholder
        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
        // Text color
        "text-gray-900 dark:text-gray-100",
        // Disabled state
        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60",
        // Error state (when aria-invalid is set)
        "aria-invalid:border-red-500 aria-invalid:focus:ring-red-500 aria-invalid:focus:border-red-500",
        // File input
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // Smooth transitions
        "transition-colors duration-200",
        // Selection
        "selection:bg-blue-500 selection:text-white",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
