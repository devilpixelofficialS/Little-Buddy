"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  helperText?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      error,
      helperText,
      showValue = true,
      formatValue,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const sliderId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const displayValue = formatValue ? formatValue(value) : value.toString();

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={sliderId}
              className="text-sm font-medium text-text-secondary"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-text-muted tabular-nums">
              {displayValue}
            </span>
          )}
        </div>
        <input
          ref={ref}
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className={`
            w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer
            accent-accent-primary disabled:opacity-50 disabled:cursor-not-allowed
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

Slider.displayName = "Slider";
