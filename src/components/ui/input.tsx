"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            px-3 py-2 bg-background-tertiary border rounded-lg text-text-primary
            placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary
            focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
            ${error ? "border-accent-danger" : "border-background-tertiary hover:border-text-muted"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-accent-danger">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
